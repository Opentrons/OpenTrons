import asyncio

import pytest
from opentrons.config.robot_configs import build_config
from opentrons.hardware_control import Controller
from opentrons.hardware_control.emulation.app import SMOOTHIE_PORT
from opentrons.types import Mount


@pytest.fixture
async def subject(loop: asyncio.BaseEventLoop, emulation_app) -> Controller:
    conf = build_config({})
    port = f"socket://127.0.0.1:{SMOOTHIE_PORT}"
    hc = await Controller.build(config=conf)
    await hc.connect(port=port)
    yield hc
    await hc._smoothie_driver.disconnect()


async def test_get_fw_version(subject: Controller):
    """It should be set."""
    await subject.update_fw_version()
    assert subject._cached_fw_version == 'EMULATOR'


async def test_get_attached_instruments(subject: Controller):
    """It should get the attached instruments."""
    instruments = await subject.get_attached_instruments({})
    assert instruments[Mount.RIGHT]['id'] == "P20SV202020070101"
    assert instruments[Mount.RIGHT]['config'].name == "p20_single_gen2"
    assert instruments[Mount.LEFT]['id'] == "P3HMV202020041605"
    assert instruments[Mount.LEFT]['config'].name == "p20_multi_gen2"


async def test_move(subject: Controller):
    """It should move."""
    new_position = {
        "X": 1.0, "Z": 2.0, "Y": 3.0, "A": 4.0, "B": 5.0, "C": 6.0
    }

    await subject.move(target_position=new_position)

    updated_position = await subject.update_position()

    assert updated_position == {
        "X": 1, "Z": 2, "Y": 3, "A": 4, "B": 5, "C": 6
    }
