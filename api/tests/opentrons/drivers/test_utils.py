from typing import Dict
import pytest
from opentrons.drivers import utils
from opentrons.drivers.types import Temperature, PlateTemperature


@pytest.mark.parametrize(
    argnames=['input_str', 'expected_result'],
    argvalues=[
        ['version:123-2 serial:serial_v model:m',
         {'version': '123-2', 'serial': 'serial_v', 'model': 'm'}],
        ['serial:serial_v model:m version:123-2 ',
         {'version': '123-2', 'serial': 'serial_v', 'model': 'm'}],
        ['   serial:serial_v model:m    version:123-2   ',
         {'version': '123-2', 'serial': 'serial_v', 'model': 'm'}]
    ]
)
def test_parse_device_information_success(
        input_str: str, expected_result: Dict[str, str]) -> None:
    """Test parse device information."""
    assert utils.parse_device_information(input_str) == expected_result


@pytest.mark.parametrize(
    argnames=['input_str'],
    argvalues=[
        ['version:123 serial:serial_v'],
        ['version:123 serialg:serial_v model:123'],
        [''],
        [None]
    ]
)
def test_parse_device_information_failure(input_str: str) -> None:
    """Test parse device information."""
    with pytest.raises(utils.ParseError):
        utils.parse_device_information(input_str)


@pytest.mark.parametrize(
    argnames=['input_str', 'expected_result'],
    argvalues=[
        ['T:none C:123.4',
         Temperature(target=None, current=123.4)],
        ['T:123.566 C:123.446',
         Temperature(target=123.57, current=123.45)],
        ['T:-123.566 C:-123.446',
         Temperature(target=-123.57, current=-123.45)],
    ]
)
def test_parse_temperature_response_success(
        input_str: str, expected_result: Temperature) -> None:
    """It should parse temperature response."""
    assert utils.parse_temperature_response(input_str, 2) == expected_result


@pytest.mark.parametrize(
    argnames=['input_str'],
    argvalues=[
        ['T:not_a_float C:123'],
        ['T:none C:none'],
        ['C:not_a_float T:123'],
        [''],
        [None]
    ]
)
def test_parse_temperature_response_failure(input_str: str) -> None:
    """It should fail to parse temperature response."""
    with pytest.raises(utils.ParseError):
        utils.parse_temperature_response(input_str, 2)


@pytest.mark.parametrize(
    argnames=['input_str', 'expected_result'],
    argvalues=[
        ['T:none C:0 H:none',
         PlateTemperature(target=None, current=0, hold=None)],
        ['T:321.4 C:45 H:123.222',
         PlateTemperature(target=321.4, current=45, hold=123.22)],
        ['T:-44.2442 C:-22.233 H:0',
         PlateTemperature(target=-44.24, current=-22.23, hold=0)],
    ]
)
def test_parse_plate_temperature_response_success(
        input_str: str, expected_result: PlateTemperature
) -> None:
    """It should parse plate temperature response"""
    assert utils.parse_plate_temperature_response(input_str, 2) == expected_result


@pytest.mark.parametrize(
    argnames=['input_str'],
    argvalues=[
        ['T:not_a_float C:123 H:321'],
        ['C:not_a_float T:123 H:321'],
        ['H:not_a_float C:123 T:321'],
        [''],
        [None]
    ]
)
def test_parse_plate_temperature_response_failure(input_str: str) -> None:
    """It should faile to parse plate temperature response"""
    with pytest.raises(utils.ParseError):
        utils.parse_plate_temperature_response(input_str, 2)
