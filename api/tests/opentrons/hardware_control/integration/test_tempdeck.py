import asyncio

import pytest
from opentrons.drivers.rpi_drivers.types import USBPort
from opentrons.hardware_control import ExecutionManager
from opentrons.hardware_control.emulation.app import TEMPDECK_PORT
from opentrons.hardware_control.modules import TempDeck


@pytest.fixture
async def tempdeck(loop: asyncio.BaseEventLoop, emulation_app) -> TempDeck:
    execution_manager = ExecutionManager(loop)
    td = await TempDeck.build(
        port=f"socket://127.0.0.1:{TEMPDECK_PORT}",
        execution_manager=execution_manager,
        usb_port=USBPort(name="", port_number=1, sub_names=[], device_path="",
                         hub=1),
        loop=loop
    )
    yield td
    await execution_manager.cancel()


def test_device_info(tempdeck) -> None:
    assert {'model': 'temp_emulator', 'serial': 'fake_serial',
            'version': '1'} == tempdeck.device_info


async def test_cycle(tempdeck) -> None:
    await tempdeck.set_temperature(10)
    assert tempdeck.live_data == {
            'status': "holding at target",
            'data': {
                'currentTemp': 10,
                'targetTemp': 10
            }
        }

    await tempdeck.deactivate()
    # Wait for poll
    await asyncio.sleep(1)
    assert tempdeck.live_data == {
        'status': "holding at target",
        'data': {
            'currentTemp': 23,
            'targetTemp': 23
        }
    }

