from aiohttp import web
from aiohttp.web_urldispatcher import UrlDispatcher

from .session import CheckCalibrationSession, LabwareStatus
from .models import CalibrationSessionStatus

ALLOWED_SESSIONS = ['check']


def _format_status(
        session: 'CheckCalibrationSession',
        router: UrlDispatcher) -> 'CalibrationSessionStatus':
    pips = session.pipettes
    # pydantic restricts dictionary keys that can be evaluated. Since
    # the session pipettes dictionary has a UUID as a key, we must first
    # convert the UUID to a hex string.
    instruments = {token.hex: data for token, data in pips.items() if token}
    current = session.state_machine.current_state.name
    next = session.state_machine.next_state
    if next:
        path = router.get(next.name, '')
        if path:
            url = path.url_for()
        else:
            url = path
        links = {'links': {next.name: url}}
    else:
        links = {'links': {}}
    status = CalibrationSessionStatus(
        instruments=instruments,
        currentStep=current,
        nextSteps=links,
        sessionToken=session.token,
        labware=[LabwareStatus(**lw) for lw in session.labware])
    return status


async def create_session(request):
    """
    POST /calibration/check/session

    If a session exists, this endpoint will return the current status.

    The status message is in the shape of:
    :py:class:`.models.CalibrationSessionStatus`
    """
    session_type = request.match_info['type']
    if session_type not in ALLOWED_SESSIONS:
        message = f'Session of type {session_type} is not supported'
        return web.json_response(message, status=403)

    session_storage = request.app['com.opentrons.session_manager']
    current_session = session_storage.sessions.get(session_type)
    if not current_session:
        hardware = request.app['com.opentrons.hardware']
        await hardware.cache_instruments()
        new_session = CheckCalibrationSession(hardware)
        session_storage.sessions[session_type] = new_session

        response = _format_status(new_session, request.app.router)
        return web.json_response(text=response.json(), status=201)
    else:
        response = _format_status(current_session, request.app.router)
        return web.json_response(text=response.json(), status=200)


async def delete_session(request):
    """
    DELETE /calibration/check/session

    Endpoint to delete a session if it exists.
    """
    session_type = request.match_info['type']
    session_storage = request.app['com.opentrons.session_manager']
    current_session = session_storage.sessions.get(session_type)
    if not current_session:
        response = {'message': f'A {session_type} session does not exist.'}
        return web.json_response(response, status=404)
    else:
        await current_session.hardware.home()
        del session_storage.sessions[session_type]
        return web.json_response(status=200)
