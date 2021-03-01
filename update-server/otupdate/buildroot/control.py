"""
otupdate.buildroot.control: non-update-specific endpoints for otupdate

This has endpoints like /restart that aren't specific to update tasks.
"""
import asyncio
import hashlib
import logging
import subprocess
from functools import lru_cache
from typing import Callable, Coroutine, Mapping

from aiohttp import web

from .constants import (
    RESTART_LOCK_NAME, DEVICE_BOOT_ID_NAME, DEVICE_NAME_VARNAME
)

LOG = logging.getLogger(__name__)


def _do_restart():
    subprocess.check_call(['reboot'])


async def restart(request: web.Request) -> web.Response:
    """ Restart the robot.

    Blocks while the restart lock is held.
    """
    async with request.app[RESTART_LOCK_NAME]:
        asyncio.get_event_loop().call_later(1, _do_restart)
    return web.json_response({'message': 'Restarting in 1s'},
                             status=200)


def build_health_endpoint(
        version_dict: Mapping[str, str])\
        -> Callable[[web.Request],
                    Coroutine[None, None, web.Response]]:
    """ Build a coroutine to serve /health that captures version info
    """
    async def health(request: web.Request) -> web.Response:
        return web.json_response(
            {
                'name': request.app[DEVICE_NAME_VARNAME],
                'updateServerVersion': version_dict.get(
                    'update_server_version', 'unknown'),
                'serialNumber': get_serial(),
                'apiServerVersion': version_dict.get(
                    'opentrons_api_version', 'unknown'),
                'smoothieVersion': 'unimplemented',
                'systemVersion': version_dict.get(
                    'buildroot_version', 'unknown'),
                'capabilities': {'buildrootUpdate': '/server/update/begin',
                                 'restart': '/server/restart'},
                'bootId': request.app[DEVICE_BOOT_ID_NAME]
            },
            headers={'Access-Control-Allow-Origin': '*'}
        )
    return health


def get_serial() -> str:
    """ Get the device serial number. """
    try:
        with open('/var/serial') as vs:
            return vs.read().strip()
    except OSError:
        return 'unknown'


class UnknownBootIDError(Exception):
    pass


def _get_os_boot_id() -> bytes:
    with open('/proc/sys/kernel/random/boot_id', 'rb') as file:
        return file.read()
    except (FileNotFoundError, PermissionError) as error:
        raise UnknownBootIDError from error


@lru_cache(maxsize=1)
def get_boot_id() -> str:
    """Return a random string that changes every time the device boots.

    Clients can poll this to detect when the OT-2 has rebooted. (Including both
    graceful reboots, like from clicking the soft "Restart" button, and
    unexpected reboots, like from interrupting the power supply).

    There are no guarantees about the returned ID's length or format. Equality
    comparison is the only valid thing to do with it.

    This ID should only change when the whole OT-2 operating system reboots.
    It shouldn't change if some internal process merely crashes and restarts.
    """

    # FIXME versioning?

    try:
        # Hash to obfuscate so no one accidentally relies on this specifically
        # being the kernel-provided boot ID. Choice of hash function is
        # arbitrary.
        return hashlib.sha256(_get_os_boot_id()).hexdigest()
    except UnknownBootIDError:
        LOG.warning(
            "Couldn't read the OS's boot ID."
            " (Are we not running on a real robot?)",
            exc_info=True
        )
        # Rely on function-level memoization for this to be constant
        # call-to-call.
        return f'debug-{uuid.uuid4()}'
