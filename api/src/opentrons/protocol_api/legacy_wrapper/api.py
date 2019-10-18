""" A backwards-compatibility shim for the new protocol API.

This should not be imported directly; it is used to provide backwards
compatible singletons in opentrons/__init__.py.
"""
import logging
import importlib.util
from typing import List, TYPE_CHECKING

from opentrons.data_storage import database as db_cmds
from opentrons.config import CONFIG
from opentrons.protocol_api.legacy_wrapper.containers_wrapper import (
    LW_TRANSLATION,
    MODULE_BLACKLIST,
    LW_NO_EQUIVALENT,
    create_new_labware_definition)
from opentrons.protocol_api.labware import save_definition
from opentrons.config.pipette_config import config_models
from opentrons.types import Mount
from ..labware import Labware
from .robot_wrapper import Robot
from .instrument_wrapper import Pipette

if TYPE_CHECKING:
    from ..contexts import ProtocolContext

log = logging.getLogger(__name__)


def run(protocol_bytes: bytes, context: 'ProtocolContext'):
    source = importlib.util.decode_source(protocol_bytes)
    exec(source)


class AddInstrumentCtors(type):

    @staticmethod
    def _build_initializer(model, proper_name):
        """ Build an initializer function for a given pipette.

        This is a separate function so that the `proper_name` is correctly
        caught in the closure that it returns.
        """

        def initializer(
                self,
                mount: str,
                trash_container: Labware = None,
                tip_racks: List[Labware] = None,
                aspirate_flow_rate: float = None,
                dispense_flow_rate: float = None,
                min_volume: float = None,
                max_volume: float = None) -> Pipette:
            return self._load_instr(model,
                                    mount)

        initializer.__name__ = proper_name
        initializer.__qualname__ = '.'.join([AddInstrumentCtors.__qualname__,
                                             proper_name])
        initializer.__doc__ = \
            """Build a {} in a backwards-compatible way.

            :param mount: The mount to load the instrument. One of
                          `'left'` or `'right'`.
            :param trash_container: If specified, a :py:class:`.Labware` to
                                    use for trash.
            :param tip_racks: If specified, a list of :py:class:`.Labware`
                              containing tips.
            :param aspirate_flow_rate: If specified, a flow rate (in uL/s)
                                       to use when aspirating. By default,
                                       the value from the pipette's
                                       configuration.
            :param dispense_flow_rate: If specified, a flow rate (in uL/s)
                                       to use when dispensing. By default,
                                       the value from the pipette's
                                       configuration.
            :param min_volume: The minimum volume that can be aspirated at
                               once. By default, the pipette's minimum
                               volume.
            :param max_volume: The maximum volume that can be aspirated at
                               once. By default, the pipette's maximum
                               volume.

            :returns: An :py:class:`.InstrumentContext`, which represents
                      the newly-loaded pipette.
            """.format(' '.join(proper_name.split('_')))
        return initializer

    def __new__(cls, name, bases, namespace, **kwds):
        """ Add the pipette initializer functions to the class. """
        res = type.__new__(cls, name, bases, namespace)
        for config in config_models:
            # Split the long name with the version
            comps = config.split('_')
            # To get the name without the version
            generic_model = '_'.join(comps[:2])
            number = comps[0].upper()
            ptype_0 = comps[1][0].upper()
            # And a nicely formatted version to name the function
            ptype = ptype_0 + comps[1][1:]
            proper_name = number + '_' + ptype
            if hasattr(res, proper_name):
                # Only build one initializer function for each versionless
                # model (i.e. don’t make a P10_Single for both p10_single_v1
                # and p10_single_v1.3)
                continue

            initializer = cls._build_initializer(generic_model, proper_name)
            setattr(res, proper_name, initializer)

        return res


class BCInstruments(metaclass=AddInstrumentCtors):
    """ A backwards-compatibility shim for the `New Protocol API`_.

    This class is provides a replacement for the `opentrons.instrument`
    global instance. Like that global instance, it shims object creation
    functions for ease of use. It should not be instantiated by user code, and
    use of its methods should be replaced with use of the corresponding methods
    of :py:class:`.ProtocolContext`. For information on how to replace calls to
    methods of this class, see the method documentation.
    """

    def __init__(
            self,
            robot: Robot) -> None:
        self._robot_wrapper = robot

    def _load_instr(self,
                    name: str,
                    mount: str) -> Pipette:
        """ Build an instrument in a backwards-compatible way.
        """
        instr_ctx = self._robot_wrapper._ctx.load_instrument(
            name, Mount[mount.upper()])
        instr = Pipette(instr_ctx)
        self._robot_wrapper._add_instrument(mount, instr)
        return instr


class BCLabware:
    """ A backwards-compatibility shim for the `New Protocol API`_.

    This class provides a replacement for the `opentrons.labware` and
    `opentrons.containers` global instances. Like those global instances,
    this class shims labware load functions for ease of use. This class should
    not be instantiated by user code, and use of its methods should be
    replaced with use of the corresponding functions of
    :py:class:`.ProtocolContext`. For information on how to replace calls to
    methods of this class, see the method documentation.
    """

    def __init__(self, ctx: 'ProtocolContext') -> None:
        self._ctx = ctx

    def load(self, container_name, slot, label=None, share=False):
        """ Load a piece of labware by specifying its name and position.

        This method calls :py:meth:`.ProtocolContext.load_labware`;
        see that documentation for more information on arguments and return
        values. Calls to this function should be replaced with calls to
        :py:meth:`.Protocolcontext.load_labware`.

        In addition, this function contains translations between old
        labware names and new labware names.
        """
        if share:
            raise NotImplementedError("Sharing not supported")

        try:
            name = LW_TRANSLATION[container_name]
        except KeyError:
            if container_name in LW_NO_EQUIVALENT:
                raise NotImplementedError("Labware {} is not supported"
                                          .format(container_name))
            elif container_name in ('magdeck', 'tempdeck'):
                # TODO(mc, 2019-06-28): when modules BC implemented, change
                # error type and message to point user to modules.load
                raise NotImplementedError("Module load not yet implemented")
            else:
                name = container_name

        return self._ctx.load_labware(name, slot, label)

    def create(self, *args, **kwargs):
        raise NotImplementedError

    def list(self, *args, **kwargs):
        raise NotImplementedError


class BCModules:
    def __init__(self, ctx: 'ProtocolContext') -> None:
        self._ctx = ctx

    def load(self, *args, **wargs):
        pass


def build_globals(context: 'ProtocolContext'):
    rob = Robot(context)
    instr = BCInstruments(rob)
    lw = BCLabware(context)
    mod = BCModules(context)
    rob._set_globals(instr, lw, mod)

    return {'robot': rob, 'instruments': instr, 'labware': lw, 'modules': mod}


def perform_migration():
    path_to_save_defs = CONFIG['labware_user_definitions_dir_v2']

    all_containers = filter(
        lambda lw: lw not in MODULE_BLACKLIST,
        db_cmds.list_all_containers())
    labware_to_create = filter(
        lambda x: x not in LW_TRANSLATION.keys(),
        all_containers)

    for lw_name in labware_to_create:
        log.debug(f"Migrating {lw_name} to API v2 format")
        labware = db_cmds.load_container(lw_name)
        if labware.wells():
            labware_def = create_new_labware_definition(labware, lw_name)
            save_definition(labware_def, location=path_to_save_defs)
    log.info("Migration of API V1 labware complete.")
