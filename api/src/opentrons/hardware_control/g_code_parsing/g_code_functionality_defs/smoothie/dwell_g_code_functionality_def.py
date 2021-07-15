from typing import Dict
from opentrons.hardware_control.g_code_parsing.g_code_functionality_defs.\
    g_code_functionality_def_base import GCodeFunctionalityDefBase


class DwellGCodeFunctionalityDef(GCodeFunctionalityDefBase):

    DWELL_ARG_KEY = 'P'

    @classmethod
    def _generate_command_explanation(cls, g_code_args: Dict[str, str]) -> str:
        duration = g_code_args[cls.DWELL_ARG_KEY]
        return f'Pausing movement for {duration}ms'

    @classmethod
    def _generate_response_explanation(cls, response: str) -> str:
        return ''
