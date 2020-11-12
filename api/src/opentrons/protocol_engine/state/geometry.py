"""Geometry state store and getters."""
from dataclasses import dataclass
from typing_extensions import final

from opentrons_shared_data.deck.dev_types import DeckDefinitionV2, SlotDefV2
from opentrons.types import Point, DeckSlotName
from opentrons.hardware_control.dev_types import PipetteDict

from .. import errors
from .substore import Substore, CommandReactive
from .labware import LabwareStore, LabwareData


# TODO(mc, 2020-11-12): reconcile this data structure with WellGeometry
@final
@dataclass(frozen=True)
class TipGeometry:
    """Tip geometry data."""

    effective_length: float
    diameter: float
    volume: int


class GeometryState:
    """Geometry getters."""

    _deck_definition: DeckDefinitionV2
    _labware_store: LabwareStore

    def __init__(
        self,
        deck_definition: DeckDefinitionV2,
        labware_store: LabwareStore
    ) -> None:
        """Initialize a GeometryState instance."""
        self._deck_definition = deck_definition
        self._labware_store = labware_store

    def get_deck_definition(self) -> DeckDefinitionV2:
        """Get the current deck definition."""
        return self._deck_definition

    def get_slot_definition(self, slot: DeckSlotName) -> SlotDefV2:
        """Get the current deck definition."""
        deck_def = self.get_deck_definition()

        for slot_def in deck_def["locations"]["orderedSlots"]:
            if slot_def["id"] == str(slot):
                return slot_def

        raise errors.SlotDoesNotExistError(
            f"Slot ID {slot} does not exist in deck {deck_def['otId']}"
        )

    def get_slot_position(self, slot: DeckSlotName) -> Point:
        """Get the position of a deck slot."""
        slot_def = self.get_slot_definition(slot)
        position = slot_def["position"]

        return Point(x=position[0], y=position[1], z=position[2])

    def get_labware_highest_z(self, labware_id: str) -> float:
        """Get the highest Z-point of a labware."""
        labware_data = self._labware_store.state.get_labware_data_by_id(
            labware_id
        )

        return self._get_highest_z_from_labware_data(labware_data)

    def get_all_labware_highest_z(self) -> float:
        """Get the highest Z-point of a labware."""
        return max([
            self._get_highest_z_from_labware_data(lw_data)
            for uid, lw_data in self._labware_store.state.get_all_labware()
        ])

    def get_well_position(self, labware_id: str, well_name: str) -> Point:
        """Get the absolute position of a well in a labware."""
        # TODO(mc, 2020-10-29): implement CSS-style key point + offset option
        # rather than defaulting to well top
        labware_data = self._labware_store.state.get_labware_data_by_id(
            labware_id
        )
        well_def = self._labware_store.state.get_well_definition(
            labware_id,
            well_name
        )
        slot_pos = self.get_slot_position(labware_data.location.slot)
        cal_offset = labware_data.calibration

        return Point(
            x=slot_pos[0] + cal_offset[0] + well_def["x"],
            y=slot_pos[1] + cal_offset[1] + well_def["y"],
            z=slot_pos[2] + cal_offset[2] + well_def["z"] + well_def["depth"],
        )

    def _get_highest_z_from_labware_data(self, lw_data: LabwareData) -> float:
        z_dim = lw_data.definition["dimensions"]["zDimension"]
        slot_pos = self.get_slot_position(lw_data.location.slot)

        return z_dim + slot_pos[2] + lw_data.calibration[2]

    # TODO(mc, 2020-11-12): reconcile with existing protocol logic
    def get_effective_tip_length(
        self,
        labware_id: str,
        pipette_config: PipetteDict
    ) -> float:
        """
        Given a labware and a pipette's config, get the effective tip length.

        Effective tip length is the nominal tip length less the distance the
        tip overlaps with the pipette nozzle.
        """
        labware_uri = self._labware_store.state.get_definition_uri(labware_id)
        nominal_length = self._labware_store.state.get_tip_length(labware_id)
        overlap_config = pipette_config["tip_overlap"]
        default_overlap = overlap_config.get("default", 0)
        overlap = overlap_config.get(labware_uri, default_overlap)

        return nominal_length - overlap

    # TODO(mc, 2020-11-12): reconcile with existing geometry logic
    def get_tip_geometry(
        self,
        labware_id: str,
        well_name: str,
        pipette_config: PipetteDict
    ) -> TipGeometry:
        """
        Given a labware, well, and hardware pipette config, get the tip geometry.

        Tip geometry includes effective tip length, tip diameter, and tip volume,
        which is all data required by the hardware controller for proper tip handling.
        """
        effective_length = self.get_effective_tip_length(labware_id, pipette_config)
        well_def = self._labware_store.state.get_well_definition(labware_id, well_name)

        if well_def["shape"] != "circular":
            raise errors.LabwareIsNotTipRackError(
                f"Well {well_name} in labware {labware_id} is not circular."
            )

        return TipGeometry(
            effective_length=effective_length,
            diameter=well_def["diameter"],
            # TODO(mc, 2020-11-12): WellDefinition type says totalLiquidVolume
            # is a float, but hardware controller expects an int
            volume=int(well_def["totalLiquidVolume"]),
        )


class GeometryStore(Substore[GeometryState], CommandReactive):
    """Geometry state container."""

    _state: GeometryState

    def __init__(
        self,
        deck_definition: DeckDefinitionV2,
        labware_store: LabwareStore
    ) -> None:
        """Initialize a geometry store and its state."""
        self._state = GeometryState(
            deck_definition=deck_definition,
            labware_store=labware_store,
        )
