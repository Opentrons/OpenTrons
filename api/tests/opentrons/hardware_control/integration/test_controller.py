import asyncio

import pytest
from opentrons.config.robot_configs import build_config
from opentrons.hardware_control import Controller
from opentrons.hardware_control.emulation.app import SMOOTHIE_PORT
from opentrons.types import Mount


@pytest.fixture
async def subject(loop: asyncio.BaseEventLoop, emulation_app) -> Controller:
    conf = build_config({})
    hc = await Controller.build(config=conf)
    await hc.connect(f"socket://127.0.0.1:{SMOOTHIE_PORT}")
    yield hc


def test_get_fw_version(subject: Controller):
    """It should be set."""
    assert subject._cached_fw_version == 'EMULATOR'


def test_get_attached_instruments(subject: Controller):
    """It should get the attached instruments."""
    instruments = subject.get_attached_instruments({})
    assert instruments[Mount.RIGHT]['id'] == "P20SV202020070101"
    assert instruments[Mount.RIGHT]['config'].name == "p20_single_gen2"
    assert instruments[Mount.LEFT]['id'] == "P3HMV202020041605"
    assert instruments[Mount.LEFT]['config'].name == "p20_multi_gen2"


def test_move(subject: Controller):
    """It should move."""
    new_position = {
        "X": 1.0, "Z": 2.0, "Y": 3.0, "A": 4.0, "B": 5.0, "C": 6.0
    }

    subject.move(target_position=new_position)

    updated_position = subject.update_position()

    assert updated_position == {
        "X": 1, "Z": 2, "Y": 3, "A": 4, "B": 5, "C": 6
    }
