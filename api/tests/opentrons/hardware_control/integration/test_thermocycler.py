import asyncio

import pytest
from opentrons.drivers.rpi_drivers.types import USBPort
from opentrons.hardware_control import ExecutionManager
from opentrons.hardware_control.emulation.app import THERMOCYCLER_PORT
from opentrons.hardware_control.modules import Thermocycler


@pytest.fixture
async def thermocycler(
        loop: asyncio.BaseEventLoop,
        emulation_app) -> Thermocycler:
    """Thermocycler fixture."""
    execution_manager = ExecutionManager(loop)
    td = await Thermocycler.build(
        port=f"socket://127.0.0.1:{THERMOCYCLER_PORT}",
        execution_manager=execution_manager,
        usb_port=USBPort(name="", port_number=1, sub_names=[], device_path="",
                         hub=1),
        loop=loop,
        polling_frequency=.001
    )
    yield td
    # Thermocycler class does not have a public interface to disconnect
    td._driver.disconnect()
    await execution_manager.cancel()


def test_device_info(thermocycler: Thermocycler):
    """It should have device info."""
    assert {'model': 'thermocycler_emulator', 'serial': 'fake_serial',
            'version': '1'} == thermocycler.device_info


async def test_lid_status(thermocycler: Thermocycler):
    """It should run open and close lid."""
    await thermocycler.wait_next_poll()
    assert thermocycler.lid_status == "closed"

    await thermocycler.open()
    await thermocycler.wait_next_poll()
    assert thermocycler.lid_status == "open"

    await thermocycler.close()
    await thermocycler.wait_next_poll()
    assert thermocycler.lid_status == "closed"


async def test_lid_temperature(thermocycler: Thermocycler):
    """It should change lid temperature."""
    await thermocycler.set_lid_temperature(temperature=50)
    assert thermocycler.lid_target == 50

    await thermocycler.set_lid_temperature(temperature=40)
    assert thermocycler.lid_target == 40

    await thermocycler.deactivate_lid()
    await thermocycler.wait_next_poll()
    assert thermocycler.lid_target == None


async def test_plate_temperature(thermocycler: Thermocycler):
    """It should change  plate temperature."""
    await thermocycler.set_temperature(temperature=52, hold_time_seconds=10)
    assert thermocycler.temperature == 52

    await thermocycler.set_temperature(temperature=55, hold_time_seconds=None)
    assert thermocycler.temperature == 55

    await thermocycler.set_temperature(temperature=80, hold_time_seconds=1)
    assert thermocycler.temperature == 80

    await thermocycler.deactivate_block()
    await thermocycler.wait_next_poll()
    assert thermocycler.target == None


async def test_cycle_temperatures(thermocycler: Thermocycler):
    """It should cycle the temperature."""
    assert thermocycler.current_cycle_index is None
    assert thermocycler.current_step_index is None
    assert thermocycler.total_cycle_count is None
    assert thermocycler.total_step_count is None

    steps = [
        {
            "temperature": 70.0,
        },
        {
            "temperature": 60.0, "hold_time_minutes": 1.0,
        },
        {
            "temperature": 50.0, "hold_time_seconds": 22.0,
        },
    ]
    await thermocycler.cycle_temperatures(steps, repetitions=2)

    # Check that final temperature was reached.
    assert thermocycler.temperature == 50
    # Check that cycle state is correct.
    assert thermocycler.current_cycle_index == 2
    assert thermocycler.current_step_index == 3
    assert thermocycler.total_cycle_count == 2
    assert thermocycler.total_step_count == 3

    # Now deactivate block to check that cycle state is cleared
    await thermocycler.deactivate_block()

    assert thermocycler.current_cycle_index is None
    assert thermocycler.current_step_index is None
    assert thermocycler.total_cycle_count is None
    assert thermocycler.total_step_count is None
