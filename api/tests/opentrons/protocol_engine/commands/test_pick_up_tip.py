"""Test pick up tip commands."""
from decoy import Decoy

from opentrons.protocol_engine.execution import (
    EquipmentHandler,
    MovementHandler,
    PipettingHandler,
)

from opentrons.protocol_engine.commands.pick_up_tip import (
    PickUpTipData,
    PickUpTipResult,
    PickUpTipImplementation,
)


async def test_pick_up_tip_implementation(
    decoy: Decoy,
    equipment: EquipmentHandler,
    movement: MovementHandler,
    pipetting: PipettingHandler,
) -> None:
    """A PickUpTip command should have an execution implementation."""
    subject = PickUpTipImplementation(
        equipment=equipment,
        movement=movement,
        pipetting=pipetting,
    )

    data = PickUpTipData(
        pipetteId="abc",
        labwareId="123",
        wellName="A3",
    )

    result = await subject.execute(data)

    assert result == PickUpTipResult()

    decoy.verify(
        await pipetting.pick_up_tip(
            pipette_id="abc",
            labware_id="123",
            well_name="A3",
        )
    )
