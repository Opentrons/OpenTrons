import json

from opentrons.util.vector import Vector


def unpack_coordinates(coordinates):
    if not isinstance(coordinates, tuple):
        coordinates = tuple([coordinates[axis] for axis in 'xyz'])

    return coordinates


def flip_coordinates(coordinates, dimensions):
    coordinates = unpack_coordinates(coordinates)
    x, y, z = coordinates
    x_size, y_size, z_size = unpack_coordinates(dimensions)

    return (x, y_size - y, z_size - z)


def break_down_travel(p1, target, increment=5, mode='absolute'):
    """
    given two points p1 and target, this returns a list of
    incremental positions or relative steps
    """

    heading = target - p1
    if mode == 'relative':
        heading = target
    length = heading.length()

    length_steps = length / increment
    length_remainder = length % increment

    vector_step = Vector(0, 0, 0)
    if length_steps > 0:
        vector_step = heading / length_steps
    vector_remainder = vector_step * (length_remainder / increment)

    res = []
    if mode is 'absolute':
        for i in range(int(length_steps)):
            p1 = p1 + vector_step
            res.append(p1)
        p1 = p1 + vector_remainder
        res.append(p1)
    else:
        for i in range(int(length_steps)):
            res.append(vector_step)
        res.append(vector_remainder)
    return res


def import_calibration_json(json_string, robot, calibrated_top=False):
    pipette_calibration = json.loads(json_string)

    for axis, data in pipette_calibration.items():

        if axis.upper() in robot._instruments:
            pipette = robot._instruments[axis.upper()]

            pipette.positions['top'] = data['top']
            pipette.positions['bottom'] = data['bottom']
            pipette.positions['blow_out'] = data['blowout']
            pipette.positions['drop_tip'] = data['droptip']

            container_data = data['theContainers']
            for name, coordinates in container_data.items():
                children = robot._deck.get_all_children()
                container = list(
                    filter(
                        lambda child: child.get_name() == name,
                        children))[0]
                z_pos = -1
                if calibrated_top:
                    if (
                        ('tip' not in name.lower()) and
                        ('rack' not in name.lower())
                    ):
                        z_pos = 1
                location = (
                    container,
                    container[0].from_center(
                        x=0,
                        y=0,
                        z=z_pos,
                        reference=container))
                # If calibration data is null for x, y, z then skip this
                # container
                if not all([coordinates[c] for c in 'xyz']):
                    continue
                pipette.calibrate_position(
                    location,
                    robot.flip_coordinates(coordinates))


def import_calibration_file(file_name, robot):
    with open(file_name) as f:
        json_string = '\n'.join(f)
        import_calibration_json(json_string, robot)


def _get_list(n):
    if not hasattr(n, '__len__') or len(n) == 0 or isinstance(n, tuple):
        n = [n]
    return n


def _create_source_target_lists(s, t, **kwargs):
    s = _get_list(s)
    t = _get_list(t)
    len_s = len(s)
    len_t = len(t)
    mode = kwargs.get('mode', 'transfer')
    if len_s < len_t:
        if mode is 'consolidate':
            raise ValueError(
                'Consolidate requires more sources than destinations')
        if (len_t / len_s) % 1 > 0:
            raise ValueError(
                'Source and destination lists must be divisible')
        s = [source for source in s for i in range(int(len_t / len_s))]
    elif len_s > len_t:
        if mode is 'distribute':
            raise ValueError(
                'Distribute requires more destinations than sources')
        if (len_s / len_t) % 1 > 0:
            raise ValueError(
                'Source and destination lists must be divisible')
        t = [dest for dest in t for i in range(int(len_s / len_t))]
    return (s, t)


def _create_volume_list(v, total, **kwargs):

    gradient = kwargs.get('gradient', None)

    if isinstance(v, tuple):
        return _create_volume_gradient(
            v[0], v[-1], total, gradient=gradient)

    v = _get_list(v)
    t_vol = len(v)
    if (t_vol < total and t_vol != 1) or t_vol > total:
        raise RuntimeError(
            '{0} volumes do not match with {1} transfers'.format(
                t_vol, total))
    if t_vol < total:
        v = [v[0]] * total
    return v


def _create_volume_gradient(min_v, max_v, total, gradient=None):

    diff_vol = max_v - min_v

    def _map_volume(i):
        nonlocal diff_vol, total
        rel_x = i / (total - 1)
        rel_y = gradient(rel_x) if gradient else rel_x
        return (rel_y * diff_vol) + min_v

    return [_map_volume(i) for i in range(total)]


def _expand_for_carryover(max_vol, plan, **kwargs):
    """
    Divide volumes larger than maximum volume into separate transfers
    """
    max_vol = float(max_vol)
    carryover = kwargs.get('carryover', True)
    if not carryover:
        return plan
    new_transfer_plan = []
    for p in plan:
        source = p['aspirate']['location']
        target = p['dispense']['location']
        volume = float(p['aspirate']['volume'])
        while volume > max_vol * 2:
            new_transfer_plan.append({
                'aspirate': {'location': source, 'volume': max_vol},
                'dispense': {'location': target, 'volume': max_vol}
            })
            volume -= max_vol

        if volume > max_vol:
            volume /= 2
            new_transfer_plan.append({
                'aspirate': {'location': source, 'volume': float(volume)},
                'dispense': {'location': target, 'volume': float(volume)}
            })
        new_transfer_plan.append({
            'aspirate': {'location': source, 'volume': float(volume)},
            'dispense': {'location': target, 'volume': float(volume)}
        })
    return new_transfer_plan


def _compress_for_repeater(max_vol, plan, **kwargs):
    """
    Reduce size of transfer plan, if mode is distribute or consolidate
    """
    max_vol = float(max_vol)
    mode = kwargs.get('mode', 'transfer')
    if mode == 'distribute':   # combine target volumes into single aspirate
        return _compress_for_distribute(max_vol, plan, **kwargs)
    if mode == 'consolidate':  # combine target volumes into multiple aspirates
        return _compress_for_consolidate(max_vol, plan, **kwargs)
    else:
        return plan


def _compress_for_distribute(max_vol, plan, **kwargs):
    """
    Combines as many dispenses as can fit within the maximum volume
    """
    source = None
    new_source = None
    a_vol = 0
    temp_dispenses = []
    new_transfer_plan = []
    disposal_vol = kwargs.get('disposal_vol', 0)
    max_vol = max_vol - disposal_vol

    def _append_dispenses():
        nonlocal a_vol, temp_dispenses, new_transfer_plan, source
        if not temp_dispenses:
            return
        added_volume = 0
        if len(temp_dispenses) > 1:
            added_volume = disposal_vol
        new_transfer_plan.append({
            'aspirate': {
                'location': source,
                'volume': a_vol + added_volume
            }
        })
        for d in temp_dispenses:
            new_transfer_plan.append({
                'dispense': {
                    'location': d['location'],
                    'volume': d['volume']
                }
            })
        a_vol = 0
        temp_dispenses = []

    for p in plan:
        this_vol = p['aspirate']['volume']
        new_source = p['aspirate']['location']
        if (new_source is not source) or (this_vol + a_vol > max_vol):
            _append_dispenses()
        source = new_source
        a_vol += this_vol
        temp_dispenses.append(p['dispense'])
    _append_dispenses()
    return new_transfer_plan


def _compress_for_consolidate(max_vol, plan, **kwargs):
    """
    Combines as many aspirates as can fit within the maximum volume
    """
    target = None
    new_target = None
    d_vol = 0
    temp_aspirates = []
    new_transfer_plan = []

    def _append_aspirates():
        nonlocal d_vol, temp_aspirates, new_transfer_plan, target
        if not temp_aspirates:
            return
        for a in temp_aspirates:
            new_transfer_plan.append({
                'aspirate': {
                    'location': a['location'], 'volume': a['volume']
                }
            })
        new_transfer_plan.append({
            'dispense': {
                'location': target, 'volume': d_vol
            }
        })
        d_vol = 0
        temp_aspirates = []

    for i, p in enumerate(plan):
        this_vol = p['aspirate']['volume']
        new_target = p['dispense']['location']
        if (new_target is not target) or (this_vol + d_vol > max_vol):
            _append_aspirates()
        target = new_target
        d_vol += this_vol
        temp_aspirates.append(p['aspirate'])
    _append_aspirates()
    return new_transfer_plan
