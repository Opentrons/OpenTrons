import logging
from typing import Any, Dict, Optional, TYPE_CHECKING

from opentrons.hardware_control import adapters, API
from .util import log_call


if TYPE_CHECKING:
    from .instrument_wrapper import Pipette
    from ..contexts import ProtocolContext
    from ..geometry import Deck
    from ..labware import Labware
    from .api import BCInstruments, BCLabware, BCModules
    from opentrons import types


log = logging.getLogger(__name__)


class Robot():
    """
    This class is the main legacy interface to the robot.

    It should never be instantiated directly; instead, the global instance may
    be accessed at :py:attr:`opentrons.robot`.

    Through this class you can can:
        * define your :class:`opentrons.Deck`
        * :meth:`connect` to Opentrons physical robot
        * :meth:`home` axis, move head (:meth:`move_to`)
        * :meth:`pause` and :func:`resume` the protocol run
        * set the :meth:`head_speed` of the robot

    Each Opentrons legacy protocol is a Python script. When evaluated the
    script creates an execution plan which is stored as a list of commands in
    Robot's command queue.

    Here are the typical steps of writing the protocol:
        * Using a Python script and the Opentrons API load your
          containers and define instruments
          (see :class:`~opentrons.instruments.pipette.Pipette`).
        * Call :meth:`reset` to reset the robot's state and clear commands.
        * Write your instructions which will get converted
          into an execution plan.
        * Review the list of commands generated by a protocol
          :meth:`commands`.
        * :meth:`connect` to the robot and call :func:`run` it on a real robot.

    See :class:`Pipette` for the list of supported instructions.
    """

    def _add_instrument(self, mount: str, instr: 'Pipette'):
        """ Internal. Register intrument with this wrapper """
        self._instrs[mount] = instr
        if self._head_speed_override:
            instr._ctx.default_speed = self._head_speed_override
        plunger_max = self._plunger_max_speed_overrides.get(mount)
        if plunger_max is not None:
            instr._set_plunger_max_speed_override(plunger_max)

    def __init__(
            self,
            protocol_ctx: 'ProtocolContext'):
        """
        Initializes a robot instance.

        Notes
        -----
        This class is a singleton. That means every time you call
        :func:`__init__` the same instance will be returned. There's
        only once instance of a robot.
        """
        self.config = protocol_ctx.config
        self._ctx = protocol_ctx
        self._head_speed_override: Optional[float] = None
        self._plunger_max_speed_overrides: Dict[str, float] = {}
        self._instrs: Dict[str, 'Pipette'] = {}
        self._bc_instr: Optional['BCInstruments'] = None
        self._bc_lw: Optional['BCLabware'] = None
        self._bc_mods: Optional['BCModules'] = None

    def _set_globals(
            self, instr: 'BCInstruments', lw: 'BCLabware', mod: 'BCModules'):
        self._bc_instr = instr
        self._bc_lw = lw
        self._bc_mods = mod

    @log_call(log)
    def reset(self):
        """
        Resets the state of the robot and clears:
            * Deck
            * Instruments
            * Command queue
            * Runtime warnings

        This is necessary only when you are using this object interactively
        from Jupyter or a Python session. It does not need to be used in
        protocols.
        """
        self._head_speed_override = None
        self._plunger_max_speed_overrides = {}
        self._instrs = {}
        for ax in list(self._ctx.max_speeds.keys()):
            self._ctx.max_speeds[ax] = None
        assert self._bc_instr and self._bc_mods and self._bc_lw,\
            'Backcompat layer not properly initialized'
        self._bc_instr._robot_wrapper = self
        self._bc_mods._ctx = self._ctx
        self._bc_lw._ctx = self._ctx

    @log_call(log)
    def connect(self, port: str = None, options: Any = None) -> bool:
        """
        Connects the robot to a serial port. In most cases, this does not need
        to be called; for instance, it does not need to be called in a protocol
        uploaded through the Opentrons App, executed with opentrons_execute,
        or simulated with opentrons_simulate. It only needs to be called when
        you use a robot object from the Jupyter notebook.

        :param port: The port to connect to. If not specified, autodetected. If
                     set to ``'Virtual Smoothie'``, connects to a virtual port.
        :param options: Unused argument provided for backwards compatibility

        :returns bool: ``True`` for success, ``False`` for failure.
        """
        hw = adapters.SynchronousAdapter.build(
            API.build_hardware_controller,
            port=port)
        self._ctx.connect(hw)
        return True

    @log_call(log)
    def home(self, *args, **kwargs):
        """
        Home robot's head and plunger motors.
        """
        self._ctx.home()

    @log_call(log)
    def head_speed(
            self, combined_speed: float = None,
            x: float = None,
            y: float = None,
            z: float = None,
            a: float = None,
            b: float = None,
            c: float = None):
        """
        Set the speeds (mm/sec) of the robot

        :param combined_speed: If specified, a positive number setting the
                               straight-line speed at which to move.
        :param x, y, z, a, b, c: If specified by axis, sets the maximum speed
                                 at which that axis will move.
        """
        if combined_speed:
            self._head_speed_override = combined_speed
            for instr in self._instrs.values():
                instr._ctx.default_speed = combined_speed

        maxes = {'x': x, 'y': y, 'z': z, 'a': a}
        for ax, m in maxes.items():
            if m:
                self._ctx.max_speeds[ax] = m
        plunger_maxes = {'left': b, 'right': c}
        for mount, maxval in plunger_maxes.items():
            if maxval is None:
                continue
            instr = self._instrs.get(mount)  # type: ignore
            self._plunger_max_speed_overrides[mount] = maxval
            if instr:
                instr._set_plunger_max_speed_override(maxval)

    @log_call(log)
    def move_to(
            self,
            location: 'types.Location',
            instrument: 'Pipette',
            strategy: str = 'arc',
            **kwargs):
        """
        Move an instrument to a coordinate, container or a coordinate within
        a container.

        Most of the time, you should just call
        :py:meth:`.instrument_wrapper.Pipette.move_to`.

        :param location: A location derived from some other method. For
                         instance, you can pass a well here, or the result of
                         ``well.top()``. Fundamentally, this is a tuple of
                         a labware reference and a point.
        :param instrument: The instrument object to move.
        :param strategy: ``'arc'`` or ``'direct'``. Forces the robot to either
                         move up and over to the destination, or move in a
                         straight line.

        :return Robot: This instance.
        """
        instrument.move_to(location, strategy)
        return self

    @log_call(log)
    def disconnect(self):
        """
        Disconnects from the robot.
        """
        return self._ctx.disconnect()

    @property
    def deck(self) -> 'Deck':
        return self._ctx.deck

    @property
    def fixed_trash(self) -> 'Labware':
        return self._ctx.fixed_trash

    @log_call(log)
    def pause(self, msg: str = None):
        """
        Pauses execution of the protocol. Use :meth:`resume` to resume
        """
        return self._ctx.pause(msg)

    @log_call(log)
    def resume(self):
        """
        Resume execution of the protocol after :meth:`pause`
        """
        return self._ctx.resume()

    @log_call(log)
    def is_connected(self):
        """ Check if this robot is connected.

        This is the inverse of :py:meth:`.is_simulating`.
        """
        return not self._ctx.is_simulating()

    @log_call(log)
    def is_simulating(self):
        """ Check if the robot is simulating or running.

        If this is a simulation, returns ``True``; if calls will cause the
        robot to move, return ``False``.
        """
        return self._ctx.is_simulating()

    @log_call(log)
    def comment(self, msg):
        """ Publish a message into the run log.

        For instance, if you do

        .. code-block:: python

            from opentrons import robot
            robot.comment("Hello, world!")

        The runlog will display "Hello, world!".
        """
        return self._ctx.comment(msg)

    @log_call(log)
    def commands(self):
        return self._ctx.commands()

    @log_call(log)
    def clear_commands(self):
        return self._ctx.clear_commands()

    def discover_modules(self):
        pass
