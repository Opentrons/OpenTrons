import asyncio
import logging
from typing import Optional

from .async_serial import AsyncSerial

log = logging.getLogger(__name__)


class SerialException(Exception):
    pass


class NoResponse(SerialException):
    pass


class AlarmResponse(SerialException):
    pass


class ErrorResponse(SerialException):
    pass


class SerialConnection:

    @classmethod
    async def create(
            cls,
            port: str,
            baud_rate: int,
            timeout: int,
            ack: str,
            name: Optional[str] = None,
            retry_wait_time_seconds: float = 0.1,
    ) -> 'SerialConnection':
        """
        Create a connection.

        Args:
            port: url or port to connect to
            baud_rate: baud rate
            timeout: timeout in seconds
            ack: the command response ack
            name: the connection name
            retry_wait_time_seconds: how long to wait between retries.

        Returns: SerialConnection
        """
        serial = await AsyncSerial.create(port=port, baud_rate=baud_rate,
                                          timeout=timeout)
        name = name or port
        return cls(
            serial=serial, port=port, name=name,
            ack=ack, retry_wait_time_seconds=retry_wait_time_seconds
        )

    def __init__(
            self,
            serial: AsyncSerial,
            port: str,
            name: str,
            ack: str,
            retry_wait_time_seconds: float
    ) -> None:
        """
        Constructor

        Args:
            serial: AsyncSerial object
            port: url or port to connect to
            ack: the command response ack
            name: the connection name
            retry_wait_time_seconds: how long to wait between retries.
        """
        self._serial = serial
        self._port = port
        self._name = name
        self._ack = ack.encode()
        self._retry_wait_time_seconds = retry_wait_time_seconds

    async def send_command(
            self, data: str, retries: int = 0
    ) -> str:
        """
        Send a command and return the response.

        Args:
            data: The data to send.
            retries: number of times to retry in case of failure

        Returns: The command response

        Raises: SerialException
        """
        data_encode = data.encode()

        for retry in range(retries + 1):
            log.debug(f'{self.name}: Write -> {data_encode!r}')
            await self._serial.write(data=data_encode)

            response = await self._serial.read_until(match=self._ack)
            log.debug(f'{self.name}: Read <- {response!r}')

            if self._ack in response:
                # Remove ack from response
                response = response.replace(self._ack, b'')
                str_response = self._pre_process_response(
                    command=data, response=response.decode()
                )
                self.raise_on_error(response=str_response)
                return str_response

            log.warning(f'{self.name}: retry number {retry}/{retries}')

            await self._on_retry()

        raise NoResponse("retry count exhausted")

    async def open(self) -> None:
        """Open the connection."""
        await self._serial.open()

    async def close(self) -> None:
        """Close the connection."""
        await self._serial.close()

    async def is_open(self) -> bool:
        """Check if connection is open."""
        return await self._serial.is_open()

    @property
    def port(self) -> str:
        return self._port

    @property
    def name(self) -> str:
        return self._name

    @staticmethod
    def raise_on_error(response: str) -> None:
        """
        Raise an error if the response contains an error

        Args:
            response: response

        Returns: None

        Raises: SerialException
        """
        lower = response.lower()
        if "error" in lower:
            raise ErrorResponse(response)

        if "alarm" in lower:
            raise AlarmResponse(response)

    async def _on_retry(self) -> None:
        """
        Opportunity for derived classes to perform action between retries. Default
        behaviour is to wait then re-open the connection.

        Returns: None
        """
        await asyncio.sleep(self._retry_wait_time_seconds)
        await self._serial.close()
        await self._serial.open()

    def _pre_process_response(self, command: str, response: str) -> str:
        """
        Opportunity for derived classes to pre-process response. Default strips
        white space.

        Args:
            command: The sent command.
            response: The raw read response minus ack.

        Returns:
            processed response.
        """
        return response.strip()
