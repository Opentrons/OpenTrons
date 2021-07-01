from abc import ABC, abstractmethod
from typing import Optional

from opentrons.hardware_control.emulation.parser import Command


class AbstractEmulator(ABC):
    """Interface of gcode line processing hardware emulator."""

    @abstractmethod
    def handle(self, line: str) -> Optional[str]:
        """Handle a command and return a response."""
        ...

    @staticmethod
    def get_terminator() -> bytes:
        """Get the command terminator for messages coming from PI."""
        return b'\r\n\r\n'

    @staticmethod
    def get_ack() -> bytes:
        """Get the command ack send to the PI."""
        return b'ok\r\nok\r\n'

    @staticmethod
    def log_g_code(command: Command) -> None:
        ...
