import asyncio
from pathlib import Path
from unittest import mock
import pytest
try:
    import aionotify
except OSError:
    aionotify = None  # type: ignore
from opentrons.hardware_control import ExecutionManager
from opentrons.hardware_control.modules import ModuleAtPort
from opentrons.hardware_control.modules.types import (
    BundledFirmware, MagneticModuleModel, ModuleType)
from opentrons.hardware_control.modules import tempdeck, magdeck
from opentrons.drivers.rpi_drivers.types import USBPort


async def test_get_modules_simulating():
    import opentrons.hardware_control as hardware_control
    mods = ['tempdeck', 'magdeck', 'thermocycler']
    api = await hardware_control.API.build_hardware_simulator(
                        attached_modules=mods)
    await asyncio.sleep(0.05)
    from_api = api.attached_modules
    assert sorted([mod.name() for mod in from_api]) == sorted(mods)


async def test_module_caching():
    import opentrons.hardware_control as hardware_control
    mod_names = ['tempdeck']
    api = await hardware_control.API.build_hardware_simulator(
        attached_modules=mod_names)
    await asyncio.sleep(0.05)

    # Check that we can add and remove modules and the caching keeps up
    found_mods = api.attached_modules
    assert found_mods[0].name() == 'tempdeck'
    await api.register_modules(
        new_mods_at_ports=[ModuleAtPort(port='/dev/ot_module_sim_magdeck1',
                                        name='magdeck')
                           ])
    with_magdeck = api.attached_modules.copy()
    assert len(with_magdeck) == 2
    assert with_magdeck[0] is found_mods[0]
    await api.register_modules(
        removed_mods_at_ports=[
            ModuleAtPort(port='/dev/ot_module_sim_tempdeck0',
                         name='tempdeck')
        ])
    only_magdeck = api.attached_modules.copy()
    assert only_magdeck[0] is with_magdeck[1]

    # Check that two modules of the same kind on different ports are
    # distinct
    await api.register_modules(
        new_mods_at_ports=[ModuleAtPort(port='/dev/ot_module_sim_magdeck2',
                                        name='magdeck')
                           ])
    two_magdecks = api.attached_modules
    assert len(two_magdecks) == 2
    assert two_magdecks[0] is with_magdeck[1]
    assert two_magdecks[1] is not two_magdecks[0]


async def test_filtering_modules():
    import opentrons.hardware_control as hardware_control
    mods = [
        'tempdeck', 'tempdeck', 'magdeck',
        'magdeck', 'thermocycler']
    api = await hardware_control.API.build_hardware_simulator(
                        attached_modules=mods)
    await asyncio.sleep(0.5)

    filtered_modules, _ = await api.find_modules(
        MagneticModuleModel.MAGNETIC_V1, ModuleType.MAGNETIC)
    assert len(filtered_modules) == 2
    assert filtered_modules == api.attached_modules[2:4]


async def test_module_update_integration(monkeypatch, loop):
    from opentrons.hardware_control import modules

    def async_return(result):
        f = asyncio.Future()
        f.set_result(result)
        return f

    bootloader_kwargs = {
        'stdout': asyncio.subprocess.PIPE,
        'stderr': asyncio.subprocess.PIPE,
        'loop': loop,
    }

    # test temperature module update with avrdude bootloader
    usb_port = USBPort(
        name='', sub_names=[], hub=None,
        port_number=None, device_path='/dev/ot_module_sim_tempdeck0')

    tempdeck = await modules.build(
            port='/dev/ot_module_sim_tempdeck0',
            usb_port=usb_port,
            which='tempdeck',
            simulating=True,
            interrupt_callback=lambda x: None,
            loop=loop,
            execution_manager=ExecutionManager(loop=loop),
            sim_model='temperatureModuleV2')

    upload_via_avrdude_mock = mock.Mock(
        return_value=(async_return((True, 'avrdude bootloader worked'))))
    monkeypatch.setattr(modules.update,
                        'upload_via_avrdude',
                        upload_via_avrdude_mock)

    async def mock_find_avrdude_bootloader_port():
        return 'ot_module_avrdude_bootloader1'

    monkeypatch.setattr(modules.update,
                        'find_bootloader_port',
                        mock_find_avrdude_bootloader_port)

    await modules.update_firmware(tempdeck, 'fake_fw_file_path', loop)
    upload_via_avrdude_mock.assert_called_once_with(
        'ot_module_avrdude_bootloader1',
        'fake_fw_file_path',
        bootloader_kwargs
    )
    upload_via_avrdude_mock.reset_mock()

    # test magnetic module update with avrdude bootloader

    magdeck = await modules.build(
            port='/dev/ot_module_sim_magdeck0',
            usb_port=usb_port,
            which='magdeck',
            simulating=True,
            interrupt_callback=lambda x: None,
            loop=loop,
            execution_manager=ExecutionManager(loop=loop))

    await modules.update_firmware(magdeck, 'fake_fw_file_path', loop)
    upload_via_avrdude_mock.assert_called_once_with(
        'ot_module_avrdude_bootloader1',
        'fake_fw_file_path',
        bootloader_kwargs
    )

    # test thermocycler module update with bossa bootloader

    thermocycler = await modules.build(
            port='/dev/ot_module_sim_thermocycler0',
            usb_port=usb_port,
            which='thermocycler',
            simulating=True,
            interrupt_callback=lambda x: None,
            loop=loop,
            execution_manager=ExecutionManager(loop=loop))

    upload_via_bossa_mock = mock.Mock(
        return_value=(async_return((True, 'bossa bootloader worked'))))
    monkeypatch.setattr(modules.update,
                        'upload_via_bossa',
                        upload_via_bossa_mock)

    async def mock_find_bossa_bootloader_port():
        return 'ot_module_bossa_bootloader1'

    monkeypatch.setattr(modules.update,
                        'find_bootloader_port',
                        mock_find_bossa_bootloader_port)

    await modules.update_firmware(thermocycler,
                                  'fake_fw_file_path',
                                  loop)
    upload_via_bossa_mock.assert_called_once_with(
        'ot_module_bossa_bootloader1',
        'fake_fw_file_path',
        bootloader_kwargs
    )


async def test_get_bundled_fw(monkeypatch, tmpdir):
    from opentrons.hardware_control import modules

    dummy_td_file = Path(tmpdir) / 'temperature-module@v1.2.3.hex'
    dummy_td_file.write_text("hello")

    dummy_md_file = Path(tmpdir) / 'magnetic-module@v3.2.1.hex'
    dummy_md_file.write_text("hello")

    dummy_tc_file = Path(tmpdir) / 'thermocycler@v0.1.2.bin'
    dummy_tc_file.write_text("hello")

    dummy_bogus_file = Path(tmpdir) / 'thermoshaker@v6.6.6.bin'
    dummy_bogus_file.write_text("hello")

    monkeypatch.setattr(modules.mod_abc, 'ROBOT_FIRMWARE_DIR', Path(tmpdir))
    monkeypatch.setattr(modules.mod_abc, 'IS_ROBOT', True)

    from opentrons.hardware_control import API
    mods = ['tempdeck', 'magdeck', 'thermocycler']
    api = await API.build_hardware_simulator(attached_modules=mods)
    await asyncio.sleep(0.05)

    assert api.attached_modules[0].bundled_fw == BundledFirmware(
        version='1.2.3', path=dummy_td_file)
    assert api.attached_modules[1].bundled_fw == BundledFirmware(
        version='3.2.1', path=dummy_md_file)
    assert api.attached_modules[2].bundled_fw == BundledFirmware(
        version='0.1.2', path=dummy_tc_file)


@pytest.mark.parametrize(
    'revision,model',
    [
        ('mag_deck_v1.1', 'magneticModuleV1'),
        ('mag_deck_v20', 'magneticModuleV2'),
        ('', 'magneticModuleV1'),
        ('asdasdadvasdasd', 'magneticModuleV1'),
        (None, 'magneticModuleV1')
    ])
def test_magnetic_module_revision_parsing(revision, model):
    assert magdeck.MagDeck._model_from_revision(revision) == model


@pytest.mark.parametrize(
    'revision,model',
    [
        ('temp_deck_v1.1', 'temperatureModuleV1'),
        ('temp_deck_v3.0', 'temperatureModuleV1'),
        ('temp_deck_v4.0', 'temperatureModuleV1'),
        ('temp_deck_v15', 'temperatureModuleV1'),
        ('temp_deck_v20', 'temperatureModuleV2'),
        ('', 'temperatureModuleV1'),
        ('v', 'temperatureModuleV1'),
        (None, 'temperatureModuleV1')
    ])
def test_temperature_module_revision_parsing(revision, model):
    assert tempdeck.TempDeck._model_from_revision(revision) == model
