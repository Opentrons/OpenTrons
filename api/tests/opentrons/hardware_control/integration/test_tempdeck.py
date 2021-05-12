import asyncio

import pytest
from opentrons.drivers.rpi_drivers.types import USBPort
from opentrons.hardware_control import ExecutionManager
from opentrons.hardware_control.emulation.app import TEMPDECK_PORT
from opentrons.hardware_control.modules import TempDeck


@pytest.fixture
async def tempdeck(loop: asyncio.BaseEventLoop, emulation_app) -> TempDeck:
    execution_manager = ExecutionManager(loop)
    module = await TempDeck.build(
        port=f"socket://127.0.0.1:{TEMPDECK_PORT}",
        execution_manager=execution_manager,
        usb_port=USBPort(name="", port_number=1, sub_names=[], device_path="",
                         hub=1),
        loop=loop
    )
    yield module
    await execution_manager.cancel()
    module.cleanup()


def test_device_info(tempdeck) -> None:
    assert {'model': 'temp_emulator', 'serial': 'fake_serial',
            'version': '1'} == tempdeck.device_info


async def test_cycle(tempdeck) -> None:
    assert tempdeck.live_data == {
        'status': "idle",
        'data': {
            'currentTemp': 25,
            'targetTemp': None
        }
    }

    await tempdeck.set_temperature(10)
    # Wait for poll
    await tempdeck._listener.wait_next_poll()
    assert tempdeck.live_data == {
            'status': "holding at target",
            'data': {
                'currentTemp': 10,
                'targetTemp': 10
            }
        }

    await tempdeck.deactivate()
    # Wait for poll
    await tempdeck._listener.wait_next_poll()
    assert tempdeck.live_data == {
        'status': "holding at target",
        'data': {
            'currentTemp': 23,
            'targetTemp': 23
        }
    }
