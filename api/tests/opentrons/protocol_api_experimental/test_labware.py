"""Tests for the Protocol API v3 labware interface."""
import pytest
from decoy import Decoy

from opentrons.protocols.models import LabwareDefinition
from opentrons.protocol_engine import DeckSlotLocation
from opentrons.protocol_engine.clients import SyncClient as ProtocolEngineClient
from opentrons.protocol_api_experimental import DeckSlotName, Labware, Point, errors
from opentrons_shared_data.labware import dev_types


@pytest.fixture
def engine_client(decoy: Decoy) -> ProtocolEngineClient:
    """Get a mock instance of a ProtocolEngineClient."""
    return decoy.mock(cls=ProtocolEngineClient)


@pytest.fixture
def subject(decoy: Decoy, engine_client: ProtocolEngineClient) -> Labware:
    """Get a Labware test subject with its dependencies mocked out."""
    return Labware(engine_client=engine_client, labware_id="labware-id")


@pytest.fixture
def labware_definition(
    minimal_labware_def: dev_types.LabwareDefinition,
) -> LabwareDefinition:
    """Create a labware definition fixture."""
    return LabwareDefinition.parse_obj(minimal_labware_def)


def test_labware_id_property(subject: Labware) -> None:
    """It should expose a property for its engine instance identifier."""
    assert subject.labware_id == "labware-id"


def test_labware_equality(engine_client: ProtocolEngineClient) -> None:
    """Two labware with the same ID should be considered equal."""
    labware_1 = Labware(engine_client=engine_client, labware_id="123")
    labware_2 = Labware(engine_client=engine_client, labware_id="123")

    assert labware_1 == labware_2


def test_labware_uri(
    decoy: Decoy, engine_client: ProtocolEngineClient, subject: Labware
) -> None:
    """It should get its definition's URI from the engine."""
    decoy.when(
        engine_client.state.labware.get_definition_uri(labware_id="labware-id")
    ).then_return("42")

    assert subject.uri == "42"


def test_labware_deck_slot_parent(
    decoy: Decoy, engine_client: ProtocolEngineClient, subject: Labware
) -> None:
    """It should return a deck slot name if labware is loaded on the deck."""
    decoy.when(
        engine_client.state.labware.get_labware_location(labware_id="labware-id")
    ).then_return(DeckSlotLocation(slot=DeckSlotName.SLOT_5))

    assert subject.parent == "5"


def test_labware_load_name(
    decoy: Decoy, engine_client: ProtocolEngineClient, subject: Labware
) -> None:
    """It should return the definition's load name."""
    decoy.when(
        engine_client.state.labware.get_load_name(labware_id="labware-id")
    ).then_return("load-name")

    assert subject.load_name == "load-name"


def test_labware_calibrated_offset(
    decoy: Decoy, engine_client: ProtocolEngineClient, subject: Labware
) -> None:
    """It should return the labware's origin point."""
    decoy.when(
        engine_client.state.geometry.get_labware_position(labware_id="labware-id")
    ).then_return(Point(1, 2, 3))

    assert subject.calibrated_offset == Point(1, 2, 3)


def test_labware_highest_z(
    decoy: Decoy, engine_client: ProtocolEngineClient, subject: Labware
) -> None:
    """It should return the labware's highest Z point."""
    decoy.when(
        engine_client.state.geometry.get_labware_highest_z(labware_id="labware-id")
    ).then_return(42.0)

    assert subject.highest_z == 42.0


def test_labware_quirks(
    decoy: Decoy, engine_client: ProtocolEngineClient, subject: Labware
) -> None:
    """It should return the labware definition's quirks."""
    decoy.when(
        engine_client.state.labware.get_quirks(labware_id="labware-id")
    ).then_return(["foo", "bar", "baz"])

    assert subject.quirks == ["foo", "bar", "baz"]


def test_labware_parameters(
    decoy: Decoy,
    engine_client: ProtocolEngineClient,
    labware_definition: LabwareDefinition,
    subject: Labware,
) -> None:
    """It should return the labware definition's parameters."""
    decoy.when(
        engine_client.state.labware.get_labware_definition(labware_id="labware-id")
    ).then_return(labware_definition)

    assert subject.parameters == labware_definition.parameters


def test_labware_magdeck_engage_height_not_compatible(
    decoy: Decoy,
    engine_client: ProtocolEngineClient,
    labware_definition: LabwareDefinition,
    subject: Labware,
) -> None:
    """It should return None for magdeck engage height if not in definition."""
    decoy.when(
        engine_client.state.labware.get_labware_definition(labware_id="labware-id")
    ).then_return(labware_definition)

    assert subject.magdeck_engage_height is None


def test_labware_magdeck_engage_height(
    decoy: Decoy,
    engine_client: ProtocolEngineClient,
    labware_definition: LabwareDefinition,
    subject: Labware,
) -> None:
    """It should return magdeck engage height from definition."""
    labware_definition.parameters.magneticModuleEngageHeight = 42.0

    decoy.when(
        engine_client.state.labware.get_labware_definition(labware_id="labware-id")
    ).then_return(labware_definition)

    assert subject.magdeck_engage_height == 42.0


def test_labware_is_not_tiprack(
    decoy: Decoy,
    engine_client: ProtocolEngineClient,
    labware_definition: LabwareDefinition,
    subject: Labware,
) -> None:
    """It should return False if not tiprack."""
    decoy.when(
        engine_client.state.labware.get_labware_definition(labware_id="labware-id")
    ).then_return(labware_definition)

    assert subject.is_tiprack is False


def test_labware_tip_length(
    decoy: Decoy,
    engine_client: ProtocolEngineClient,
    labware_definition: LabwareDefinition,
    subject: Labware,
) -> None:
    """It should return tip length if present in the definition."""
    labware_definition.parameters.tipLength = 42.0

    decoy.when(
        engine_client.state.labware.get_labware_definition(labware_id="labware-id")
    ).then_return(labware_definition)

    assert subject.tip_length == 42.0


def test_labware_no_tip_length(
    decoy: Decoy,
    engine_client: ProtocolEngineClient,
    labware_definition: LabwareDefinition,
    subject: Labware,
) -> None:
    """It should raise a LabwareIsNotTiprackError if tip length is not present."""
    decoy.when(
        engine_client.state.labware.get_labware_definition(labware_id="labware-id")
    ).then_return(labware_definition)

    with pytest.raises(errors.LabwareIsNotTipRackError):
        subject.tip_length
