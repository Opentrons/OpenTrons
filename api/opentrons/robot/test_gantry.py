from opentrons.robot import gantry
from opentrons  import instruments
from opentrons.drivers.smoothie_drivers.v3_0_0 import driver_3_0


def avg(n1, n2):
    return (n1 + n2 / 2.0)

pip = instruments.Pipette('a', max_volume=200)
driver = driver_3_0.SmoothieDriver_3_0_0()


gant = gantry.Gantry(driver)
gant.add_instrument('c', pip)
print(pip.motor)



probe_dimensions = {'length': 44, 'width': 35, 'height':63}
probe_center = {'z': 227.0, 'c': 18.9997, 'b': 18.9997, 'a': 109.0, 'x': 267.748, 'y': 290.4987}
probing_distance = 10
switch_offset = 4  # because they're angled and have holes
max_expected_tip_length = 90


#FIXME: Offset calculations should alraedy be reflected in switch_position
def _probe_switch(axis, probing_distance, switch_position):
    switch_position[axis] -= probing_distance

    safe_height = probe_dimensions['height'] + max_expected_tip_length
    if 'z' in switch_position:
        driver.move(z=safe_height)
    else:
        driver.move(a=safe_height)
    driver.move(x=switch_position.get('x'), y=switch_position.get('y'))

    # TODO: make this non-implicit
    driver.move(a=switch_position.get('a'), z=switch_position.get('z'))
    probed_pos = driver.probe_axis(axis, probing_distance)
    driver.move(
        x=switch_position.get('x'),
        y=switch_position.get('y'),
        z=switch_position.get('z'),
        a=switch_position.get('a')
    )
    return probed_pos


def probe(pipette):
    # for axis is 'xya':
    #     _probe_switch(axis, )

    switch_pos_1 = {
        'x': probe_center['x'] - (probe_dimensions['width'] / 2),
        'y': probe_center['y'] - switch_offset,
        'a': probe_dimensions['height'] + 1
    }

    switch_pos_2 = {
        'x': probe_center['x'] + (probe_dimensions['width'] / 2),
        'y': probe_center['y'] - switch_offset,
        'a': probe_dimensions['height'] + 1
    }

    switch_pos_3 = {
        'x': probe_center['x'] - switch_offset,
        'y': probe_center['y'] + (probe_dimensions['length'] / 2),
        'a': probe_dimensions['height'] + 1
    }

    switch_pos_4 = {
        'x': probe_center['x'] - switch_offset,
        'y': probe_center['y'] - (probe_dimensions['length'] / 2),
        'a': probe_dimensions['height'] + 1
    }

    switch_pos_5 = {
        'x': probe_center['x'],
        'y': probe_center['y'] + switch_offset,
        'a': probe_dimensions['height']
    }

    probe_1 = _probe_switch('x', probing_distance, switch_pos_1)
    probe_2 = _probe_switch('x', -probing_distance, switch_pos_2)
    probe_3 = _probe_switch('y', -probing_distance, switch_pos_3)
    probe_4 = _probe_switch('y', probing_distance, switch_pos_4)
    probe_5 = _probe_switch('a', -max_expected_tip_length, switch_pos_5)

    print('PROBE_1: ', probe_1)
    print('PROBE_2: ', probe_2)
    print('PROBE_3: ', probe_3)
    print('PROBE_4: ', probe_4)
    print('PROBE_5: ', probe_5)


def calibrate_pipette(probing_values, probe):
    ''' Interprets values generated from tip probing returns '''
    x_left, x_right, y_top, y_bottom, z = probing_values
    probed_x = avg(x_left, x_right)
    probed_y = avg(y_top, y_bottom)

    update_position_with_delta((pobed_x, probed_y) - probe.position)
    save_tip_length(tip_type, probing_values['z'] - probe.height)




driver.home()
probe(pip)
























