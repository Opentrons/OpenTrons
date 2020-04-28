import abc
import asyncio
import enum
import logging
from typing import Tuple
from opentrons import types as top_types

MODULE_LOG = logging.getLogger(__name__)


class Axis(enum.Enum):
    X = 0
    Y = 1
    Z = 2
    A = 3
    B = 4
    C = 5

    @classmethod
    def by_mount(cls, mount: top_types.Mount):
        bm = {top_types.Mount.LEFT: cls.Z,
              top_types.Mount.RIGHT: cls.A}
        return bm[mount]

    @classmethod
    def gantry_axes(cls) -> Tuple['Axis', 'Axis', 'Axis', 'Axis']:
        """ The axes which are tied to the gantry and require the deck
        calibration transform
        """
        return (cls.X, cls.Y, cls.Z, cls.A)

    @classmethod
    def of_plunger(cls, mount: top_types.Mount):
        pm = {top_types.Mount.LEFT: cls.B,
              top_types.Mount.RIGHT: cls.C}
        return pm[mount]

    @classmethod
    def to_mount(cls, inst: 'Axis'):
        return {
            cls.Z: top_types.Mount.LEFT,
            cls.A: top_types.Mount.RIGHT,
            cls.B: top_types.Mount.LEFT,
            cls.C: top_types.Mount.RIGHT
        }[inst]

    def __str__(self):
        return self.name


class HardwareAPILike(abc.ABC):
    """ A dummy class useful in isinstance checks to accept an API or adapter
    """
    @property
    def loop(self) -> asyncio.AbstractEventLoop:
        ...


class BoardRevision(enum.Enum):
    UNKNOWN = enum.auto()
    OG = enum.auto()
    A = enum.auto()
    B = enum.auto()
    C = enum.auto()

    @classmethod
    def by_bits(cls, rev_bits: Tuple[bool, bool]):
        br = {
            (True, True): cls.OG,
            (False, True): cls.A,
            (True, False): cls.B,
            (False, False): cls.C
        }
        return br[rev_bits]

    def __str__(self):
        return '2.1' if self.name == 'OG' else self.name


class CriticalPoint(enum.Enum):
    """ Possibilities for the point to move in a move call.

    The active critical point determines the offsets that are added to the
    gantry position when moving a pipette around.
    """
    MOUNT = enum.auto()
    """
    For legacy reasons, the position of the end of a P300 single. The default
    when no pipette is attached, and used for consistent behavior in certain
    contexts (like change pipette) when a variety of different pipettes might
    be attached.
    """

    NOZZLE = enum.auto()
    """
    The end of the nozzle of a single pipette or the end of the back-most
    nozzle of a multipipette. Only relevant when a pipette is present.
    """

    TIP = enum.auto()
    """
    The end of the tip of a single pipette or the end of the back-most
    tip of a multipipette. Only relevant when a pipette is present and
    a tip with known tip length is attached.
    """

    XY_CENTER = enum.auto()
    """
    Separately from the z component of the critical point, XY_CENTER means
    the critical point under consideration is the XY center of the pipette.
    This changes nothing for single pipettes, but makes multipipettes
    move their centers - so between channels 4 and 5 - to the specified
    point.
    """

    FRONT_NOZZLE = enum.auto()
    """
    The end of the front-most nozzle of a multipipette with a tip attached.
    Only relevant when a multichannel pipette is present.
    """


class ExecutionState(enum.Enum):
    RUNNING = enum.auto()
    PAUSED = enum.auto()
    CANCELLED = enum.auto()

    def __str__(self):
        return self.name


class ExecutionCancelledError(RuntimeError):
    pass


class MustHomeError(RuntimeError):
    pass


class NoTipAttachedError(RuntimeError):
    pass
