import asyncio
import logging
from typing import Dict, Tuple, Union
from datetime import datetime, timezone
from opentrons.util.helpers import utc_now

log = logging.getLogger(__name__)


def _str_to_dict(res_str) -> Dict[str, Union[str, bool]]:
    res_lines = res_str.splitlines()
    res_dict = {}
    try:
        for line in res_lines:
            if line:
                prop, val = line.split('=')
                res_dict[prop] = val if val not in ['yes', 'no'] \
                    else val == 'yes'  # Convert yes/no to boolean value
    except (ValueError, IndexError) as e:
        raise Exception("Error converting timedatectl string: {}".format(e))
    return res_dict


async def _time_status(loop: asyncio.AbstractEventLoop = None
                       ) -> Dict[str, Union[str, bool]]:
    """
    Get details of robot's date & time, with specifics of RTC (if present)
    & status of NTP synchronization.
    :return: Dictionary of status params
    """
    proc = await asyncio.create_subprocess_shell(
        'timedatectl show',
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        loop=loop or asyncio.get_event_loop()
    )
    out, err = await proc.communicate()
    return _str_to_dict(out.decode())


async def _set_time(time: str,
                    loop: asyncio.AbstractEventLoop = None) -> Tuple[str, str]:
    proc = await asyncio.create_subprocess_shell(
        f'date --utc --set \"{time}\"',
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        loop=loop or asyncio.get_event_loop()
    )
    out, err = await proc.communicate()
    return out.decode(), err.decode()


async def get_system_time(loop: asyncio.AbstractEventLoop = None) -> datetime:
    """
    :return: Just the system time as a UTC datetime object
    """
    return utc_now()


async def set_system_time(
                        new_time_dt: datetime,
                        loop: asyncio.AbstractEventLoop = None
                        ) -> Tuple[datetime, str]:
    """
    Set the system time unless system time is already being synchronized using
    an RTC or NTPsync.
    :return: Tuple specifying current date read and error message, if any.
    """
    status = await _time_status(loop)
    if status.get('LocalRTC') or status.get('NTPSynchronized'):
        # TODO: Update this to handle RTC sync correctly once we introduce RTC
        err = 'Cannot set system time; already synchronized with NTP or RTC'
    else:
        new_time_dt = new_time_dt.astimezone(tz=timezone.utc)
        new_time_str = new_time_dt.strftime("%Y-%m-%d %H:%M:%S")
        log.info(f'Setting time to {new_time_str} UTC')
        out, err = await _set_time(new_time_str)
    return utc_now(), err
