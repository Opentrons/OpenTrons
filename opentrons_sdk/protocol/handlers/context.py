from opentrons_sdk.protocol.handlers import ProtocolHandler
from opentrons_sdk.labware import deck, instruments
from opentrons_sdk.containers import legacy_containers, placeable


class ContextHandler(ProtocolHandler):

    """
    ContextHandler runs all the stuff on the virtual robot in the background
    and makes relevant data available.
    """

    _deck = None
    _instruments = None  # Axis as keys; Pipette object as vals.

    # Calibration is organized by axis.
    #
    # {
    #   'a': {'_axis': {top, bottom, blowout}, (0,0): {x, y, top, bottom}}
    # }
    _calibration = None

    def setup(self):
        self._deck = placeable.Deck()
        self.setup_deck()

        self._initial_deck = copy.deepcopy(self._deck)

        'deck.slot.container.well'
        '*.id(slot).microplate.A1': (+1, -2, +3)
        '*.id(slot).microplate.A1': (+1, -2, +3)
        '*.id(slot).microplate.A1': (+1, -2, +3)

        calibrations = {
            'deck': {
                'slot':'',
            }
        }

        self._instruments = {}
        self._calibration = {}


    def get_deck_slot_types(self):
        return 'acrylic_slots'

    def get_slot_offsets(self):
        """
        col_offset
        - from bottom left corner of A to bottom corner of B

        row_offset
        - from bottom left corner of 1 to bottom corner of 2

        TODO: figure out actual X and Y offsets (from origin)
        """
        SLOT_OFFSETS = {
            '3d_printed_slots': {
                'x_offset': 10,
                'y_offset': 10,
                'col_offset': 91,
                'row_offset': 134.5
            },
            'acrylic_slots': {
                'x_offset': 10,
                'y_offset': 10,
                'col_offset': 96.25,
                'row_offset': 133.3
            }

        }
        slot_settings = SLOT_OFFSETS.get(self.get_deck_slot_types())
        row_offset = slot_settings.get('row_offset')
        col_offset = slot_settings.get('col_offset')
        x_offset = slot_settings.get('x_offset')
        y_offset = slot_settings.get('y_offset')
        return (row_offset, col_offset, x_offset, y_offset)

    def get_max_robot_rows(self):
        # TODO: dynamically figure out robot rows
        return 3

    def setup_deck(self):
        robot_rows = self.get_max_robot_rows()
        row_offset, col_offset, x_offset, y_offset = self.get_slot_offsets()

        for col_index, col in enumerate('EDCBA'):
            for row_index, row in enumerate(range(robot_rows, 0, -1)):
                slot = placeable.Slot()
                slot_coordinates = (
                    (row_offset * row_index) + x_offset,
                    (col_offset * col_index) + y_offset,
                    0  # TODO: should z always be zero?
                )
                slot_name = "{}{}".format(col, row)
                self._deck.add(slot, slot_name, (slot_coordinates))

    def get_deck(self):
        return self._deck

    def add_instrument(self, axis, instrument=None):
        axis = axis.upper()
        # We only have pipettes now so this is pipette-specific.
        self._instruments[axis] = instrument
        self._instruments[axis]._axis = axis

    def get_instrument(self, axis=None, **kwargs):
        if axis is not None:
            axis = self.normalize_axis(axis)
            if axis not in self._instruments:
                raise KeyError(
                    "No instrument assigned to {} axis.".format(axis)
                )
            else:
                inst = self._instruments[axis]
                inst._axis = axis
                if axis in self._calibration:
                    if '_axis' in self._calibration[axis]:
                        inst.calibrate(**self._calibration[axis]['_axis'])
                return self._instruments[axis]
        volume = kwargs.pop('volume', None)
        for k, i in sorted(self._instruments.items()):
            match = True
            if volume and i.supports_volume(volume) is False:
                    continue
            for j, v in kwargs.items():
                if getattr(i, j) != v:
                    match = False
                    break
            if match:
                return self.get_instrument(axis=k)

        return None

    def get_instruments(self):
        """
        :returns: sorted list of (axis, instrument)
        """
        return sorted(self._instruments.items())

    def add_container(self, slot, container_name):
        container = legacy_containers.get_legacy_container(container_name)
        self._deck[slot].add(container, container_name)
        return container

    def get_containers(self):
        return self._deck.containers()

    def get_only_instrument(self):
        ks = list(self._instruments)
        if len(ks) > 0:
            return self.get_instrument(axis=ks[0])
        if len(ks) is 0:
            raise KeyError("No instruments loaded.")
        else:
            return None

    def normalize_axis(self, axis):
        """
        Returns an axis by axis, after normalizing axis input.

        If axis is none, the first instrument axis if only one instrument is
        attached to the protocol.

        If the axis isn't valid, it raises a KeyError.
        """
        if axis is None:
            raise KeyError("Axis must be specified.")
        axis = axis.upper()
        if axis not in self._instruments:
            raise KeyError("Can't find instrument for axis {}.".format(axis))
        return axis

    def get_axis_calibration(self, axis):
        """
        Initializes and returns calibration for a particular axis.
        """
        if axis is None:
            axis = self.get_only_instrument().axis
        if axis is None:
            raise KeyError(
                "Calibration axis must be specified when multiple " +
                "instruments are loaded."
            )
        axis = self.normalize_axis(axis)
        if axis not in self._calibration:
            self._calibration[axis] = {}
        return self._calibration[axis]

    def calibrate(self, pos, axis=None, x=None, y=None, z=None, top=None,
                  bottom=None):
        if axis is None:
            instrument = self.get_only_instrument()
            if instrument is None:
                raise KeyError(
                    "Calibration axis must be specified when multiple " +
                    "instruments are loaded."
                )
            axis = instrument.axis
        cal = self.get_axis_calibration(axis)
        if pos not in cal:
            cal[pos] = {}
        pos_cal = cal[pos]
        # Roll in all the new calibration changes.
        if x is not None:
            pos_cal['x'] = x
        if y is not None:
            pos_cal['y'] = y
        if z is not None:
            pos_cal['z'] = z
        if top is not None:
            pos_cal['top'] = top
        if bottom is not None:
            pos_cal['bottom'] = bottom

    def calibrate_instrument(self, axis, top=None, blowout=None, droptip=None,
                             bottom=None):
        cal = self.get_axis_calibration(axis)
        if '_instrument' not in cal:
            cal['_instrument'] = {}
        a_cal = cal['_instrument']
        # Roll in all the new calibration changes.
        if top is not None:
            a_cal['top'] = top
        if bottom is not None:
            a_cal['bottom'] = bottom
        if blowout is not None:
            a_cal['blowout'] = blowout
        if droptip is not None:
            a_cal['droptip'] = droptip
        if bottom is not None:
            a_cal['bottom'] = bottom
        self.get_instrument(axis=axis).calibrate(**a_cal)

    def get_coordinates(self, position, axis=None):
        """ Returns the calibrated coordinates for a position. """
        cal = self.get_axis_calibration(axis)
        slot, well = position
        defaults = ({'top': 0, 'bottom': 0, 'x': 0, 'y': 0})
        output = {}
        # Calibration for A1 in this container (x, y, top, bottom).
        slot_cal = {}
        slot_cal.update(defaults)
        slot_cal.update(cal.get((slot), {}))
        # Default offset on x, y calculated from container definition.
        ox, oy = self._deck.slot(slot).get_child(well).coordinates()
        # x, y, top bottom
        well_cal = cal.get((slot, well), {})
        output.update(well_cal)
        # Use calculated offsets if no custom well calibration provided.
        if 'x' not in output:
            output['x'] = slot_cal['x'] + ox
        if 'y' not in output:
            output['y'] = slot_cal['y'] + oy
        # Merge slot and well calibration
        if 'top' not in output:
            output['top'] = slot_cal['top']
        if 'bottom' not in output:
            output['bottom'] = slot_cal['bottom']
        return output

    def get_tip_coordinates(self, pipette):
        name = 'tiprack.{}'.format(pipette.name)
        tiprack = self.find_container(name=name, has_tips=True)
        if tiprack is None:
            raise KeyError("No tiprack found for {}.".format(name))
        tip = tiprack.get_next_tip()
        return self.get_coordinates(tip.address, axis=pipette.axis)

    def get_trash_coordinates(self, axis=None):
        trash = self.find_container(name='point.trash')
        if trash is None:
            raise KeyError("No disposal point (trash) on deck.")
        return self.get_coordinates(trash.address + [(0, 0)], axis)

    def get_volume(self, well):
        slot, well = self._protocol._normalize_address(well)
        return self._deck.slot(slot).well(well).get_volume()

    def transfer(self, start=None, end=None, volume=None, **kwargs):
        start_slot, start_well = start
        end_slot, end_well = end
        start = self._deck.slot(start_slot).well(start_well)
        end = self._deck.slot(end_slot).well(end_well)
        start.transfer(volume, end)

    def transfer_group(self, *args, **kwargs):
        pass

    def distribute(self, *args, **kwargs):
        pass

    def mix(self, *args, **kwargs):
        pass

    def consolidate(self, *args, **kwargs):
        pass
