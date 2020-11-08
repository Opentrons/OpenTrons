"""Motion state store and getters."""
from dataclasses import dataclass
from typing import List, Optional

from opentrons.types import MountType, Point
from opentrons.hardware_control.types import CriticalPoint
from opentrons.motion_planning import (
    MoveType,
    Waypoint,
    MotionPlanningError,
    get_waypoints,
)

from .. import command_models as cmd, errors
from .substore import Substore, CommandReactive
from .labware import LabwareStore
from .pipettes import PipetteStore
from .geometry import GeometryStore


@dataclass(frozen=True)
class LocationData:
    """Last used pipette, labware, and well."""

    pipette_id: str
    labware_id: str
    well_id: str


@dataclass(frozen=True)
class PipetteLocationData:
    """Pipette data used to determine the current gantry position."""

    mount: MountType
    critical_point: Optional[CriticalPoint]


class MotionState:
    """Motion planning state and getter methods."""

    _labware_store: LabwareStore
    _pipette_store: PipetteStore
    _geometry_store: GeometryStore
    _current_location: Optional[LocationData]

    def __init__(
        self,
        labware_store: LabwareStore,
        pipette_store: PipetteStore,
        geometry_store: GeometryStore,
    ) -> None:
        """Initialize a MotionState instance."""
        self._labware_store = labware_store
        self._pipette_store = pipette_store
        self._geometry_store = geometry_store
        self._current_location = None

    def get_current_location_data(self) -> Optional[LocationData]:
        """Get the current pipette and deck location the protocol is at."""
        return self._current_location

    def get_pipette_location(self, pipette_id: str) -> PipetteLocationData:
        """Get the critical point of a pipette given the current location."""
        current_loc = self.get_current_location_data()
        pipette_data = self._pipette_store.state.get_pipette_data_by_id(
            pipette_id
        )

        mount = pipette_data.mount
        critical_point = None

        # if the pipette was last used to move to a labware that requires
        # centering, set the critical point to XY_CENTER
        if (
            current_loc is not None and
            current_loc.pipette_id == pipette_id and
            self._labware_store.state.get_labware_has_quirk(
                current_loc.labware_id,
                "centerMultichannelOnWells"
            )
        ):
            critical_point = CriticalPoint.XY_CENTER

        return PipetteLocationData(mount=mount, critical_point=critical_point)

    def get_movement_waypoints(
        self,
        pipette_id: str,
        labware_id: str,
        well_id: str,
        origin: Point,
        origin_cp: Optional[CriticalPoint],
        max_travel_z: float
    ) -> List[Waypoint]:
        """Get the movement waypoints from an origin to a given location."""
        location = self.get_current_location_data()
        center_dest = self._labware_store.state.get_labware_has_quirk(
            labware_id,
            "centerMultichannelOnWells",
        )

        dest = self._geometry_store.state.get_well_position(
            labware_id,
            well_id
        )
        dest_cp = CriticalPoint.XY_CENTER if center_dest else None

        if (
            location is not None and
            pipette_id == location.pipette_id and
            labware_id == location.labware_id
        ):
            move_type = (
                MoveType.IN_LABWARE_ARC
                if well_id != location.well_id else
                MoveType.DIRECT
            )
            min_travel_z = self._geometry_store.state.get_labware_highest_z(
                labware_id
            )
        else:
            move_type = MoveType.GENERAL_ARC
            min_travel_z = self._geometry_store.state.\
                get_all_labware_highest_z()

        try:
            return get_waypoints(
                move_type=move_type,
                origin=origin,
                origin_cp=origin_cp,
                dest=dest,
                dest_cp=dest_cp,
                min_travel_z=min_travel_z,
                max_travel_z=max_travel_z,
                xy_waypoints=[],
            )
        except MotionPlanningError as error:
            raise errors.FailedToPlanMoveError(str(error))


class MotionStore(Substore[MotionState], CommandReactive):
    """Motion state container."""

    _state: MotionState

    def __init__(
        self,
        labware_store: LabwareStore,
        pipette_store: PipetteStore,
        geometry_store: GeometryStore,
    ) -> None:
        """Initialize a MotionStore and its state."""
        self._state = MotionState(
            labware_store=labware_store,
            pipette_store=pipette_store,
            geometry_store=geometry_store,
        )

    def handle_completed_command(
        self,
        command: cmd.CompletedCommandType
    ) -> None:
        """Modify state in reaction to a CompletedCommand."""
        if isinstance(
            command.result,
            (cmd.MoveToWellResult, cmd.AspirateResult, cmd.DispenseResult)
        ):
            self._state._current_location = LocationData(
                pipette_id=command.request.pipetteId,
                labware_id=command.request.labwareId,
                well_id=command.request.wellId,
            )
