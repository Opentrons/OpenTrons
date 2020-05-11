import pytest
from unittest.mock import MagicMock, PropertyMock, patch

import typing
from pydantic.main import BaseModel
from uuid import uuid4

from opentrons.server.endpoints.calibration.session \
    import CheckCalibrationSession, CalibrationCheckState, \
    CalibrationCheckTrigger
from opentrons.server.endpoints.calibration.models import \
    SessionType, JogPosition
from opentrons import types

from robot_server.service.dependencies import get_session_manager


@pytest.fixture
def session_details():
    sess_dict = {
        'attributes': {
            'details': {
                'comparisonsByStep': {},
                'currentStep': 'preparingFirstPipette',
                'instruments': {},
                'labware': [],
            },
            'session_type': 'check',
            'session_id': 'check',
        },
        'type': 'Session',
        'id': 'check'
    }
    return sess_dict


@pytest.fixture
def mock_cal_session(hardware, loop):
    # TODO: The mock instrs dictionary needs
    # to be modified to fit changes that
    # remove instances of pip id in
    # the check calibration session class.
    id1 = uuid4()
    id2 = uuid4()
    mock_instrs = {
        id1: {
            'mount': types.Mount.LEFT,
            'tiprack_id': None,
            'critical_point': None},
        id2: {
            'mount': types.Mount.RIGHT,
            'tiprack_id': None,
            'critical_point': None}
    }
    other_instrs = {
        types.Mount.LEFT: {
            'model': 'p10_single_v1',
            'has_tip': False,
            'max_volume': 10,
            'name': 'p10_single',
            'tip_length': 0,
            'channels': 1},
        types.Mount.RIGHT: {
            'model': 'p300_single_v1',
            'has_tip': False,
            'max_volume': 300,
            'name': 'p300_single',
            'tip_length': 0,
            'channels': 1}
    }

    def fake_get_pip(mount):
        return other_instrs[mount]

    CheckCalibrationSession._key_by_uuid = MagicMock(return_value=mock_instrs)
    CheckCalibrationSession.get_pipette = MagicMock(side_effect=fake_get_pip)

    m = CheckCalibrationSession(hardware)

    async def async_mock(*args, **kwargs):
        pass

    m.trigger_transition = MagicMock(side_effect=async_mock)
    m.delete_session = MagicMock(side_effect=async_mock)

    path = 'opentrons.server.endpoints.calibration.' \
           'session.CheckCalibrationSession.current_state_name'
    with patch(path, new_callable=PropertyMock) as p:
        p.return_value = CalibrationCheckState.preparingFirstPipette.value

        m.get_potential_triggers = MagicMock(return_value={
            CalibrationCheckTrigger.jog,
            CalibrationCheckTrigger.pick_up_tip,
            CalibrationCheckTrigger.exit
        })
        yield m


@pytest.fixture
def patch_build_session(mock_cal_session):
    r = "robot_server.service.routers.session.CheckCalibrationSession.build"
    with patch(r) as p:
        async def mock_build(hardware):
            return mock_cal_session
        p.side_effect = mock_build
        yield p


@pytest.fixture
def session_manager_with_session(mock_cal_session):
    manager = get_session_manager()
    manager.sessions[SessionType.check] = mock_cal_session

    yield mock_cal_session

    if SessionType.check in manager.sessions:
        del manager.sessions[SessionType.check]


@pytest.fixture
def session_hardware_info(mock_cal_session, session_details):
    current_state = mock_cal_session.current_state_name
    lw_status = mock_cal_session.labware_status.values()
    comparisons_by_step = mock_cal_session.get_comparisons_by_step()
    instruments = {
        str(k): {'model': v.model,
                 'name': v.name,
                 'tip_length': v.tip_length,
                 'mount': v.mount.value,
                 'has_tip': v.has_tip,
                 'tiprack_id': str(v.tiprack_id)}
        for k, v in mock_cal_session.pipette_status().items()
    }
    info = {
        'instruments': instruments,
        'labware': [{
            'alternatives': data.alternatives,
            'slot': data.slot,
            'id': str(data.id),
            'forPipettes': [str(_id) for _id in data.forPipettes],
            'loadName': data.loadName,
            'namespace': data.namespace,
            'version': str(data.version)} for data in lw_status],
        'currentStep': current_state,
        'comparisonsByStep': comparisons_by_step
    }
    session_details["attributes"].update({"details": info})
    return session_details


def test_create_session_already_present(api_client,
                                        session_manager_with_session):
    response = api_client.post("/sessions", json={
        "data": {
            "type": "Session",
            "attributes": {
                "sessionType": "check"
            }
        }
    })
    assert response.json() == {
        'errors': [{
            'detail': "A session with id 'check' already exists. "
                      "Please delete to proceed.",
            'links': {'DELETE': '/sessions/check'},
            'status': '409',
            'title': 'Conflict'
        }]
    }
    assert response.status_code == 409


def test_create_session_error(api_client,
                              patch_build_session):
    async def raiser(hardware):
        raise AssertionError("Please attach pipettes before proceeding")

    patch_build_session.side_effect = raiser

    response = api_client.post("/sessions", json={
        "data": {
            "type": "Session",
            "attributes": {
                "sessionType": "check"
            }
        }
    })
    assert response.json() == {
        'errors': [{
            'detail': "Failed to create session of type 'check': Please "
                      "attach pipettes before proceeding.",
            'status': '400',
            'title': 'Creation Failed'}
        ]}
    assert response.status_code == 400


def test_create_session(api_client, patch_build_session,
                        session_hardware_info):
    response = api_client.post("/sessions", json={
        "data": {
            "type": "Session",
            "attributes": {
                "sessionType": "check"
            }
        }
    })

    assert response.json() == {
        'data': session_hardware_info,
        'links': {
            'POST': {
                'href': '/sessions/check/commands',
            },
            'GET': {
                'href': '/sessions/check',
            },
            'DELETE': {
                'href': '/sessions/check',
            },
        }
    }
    assert response.status_code == 200
    # Clean up
    get_session_manager().sessions.clear()


def test_delete_session_not_found(api_client):
    response = api_client.delete("/sessions/check")
    assert response.json() == {
        'errors': [{
            'detail': "Cannot find session with id 'check'.",
            'links': {'POST': '/sessions'},
            'status': '404',
            'title': 'No session'
        }]
    }
    assert response.status_code == 404


def test_delete_session(api_client, session_manager_with_session,
                        mock_cal_session,
                        session_hardware_info):
    response = api_client.delete("/sessions/check")
    mock_cal_session.delete_session.assert_called_once()
    assert response.json() == {
        'data': session_hardware_info,
        'links': {
            'POST': {
                'href': '/sessions',
            },
        }
    }
    assert response.status_code == 200


def test_get_session_not_found(api_client):
    response = api_client.get("/sessions/1234")
    assert response.json() == {
        'errors': [{
            'detail': "Cannot find session with id '1234'.",
            'links': {'POST': '/sessions'},
            'status': '404',
            'title': 'No session'
        }]
    }
    assert response.status_code == 404


def test_get_session(api_client, session_manager_with_session,
                     session_hardware_info):
    response = api_client.get("/sessions/check")
    assert response.json() == {
        'data': session_hardware_info,
        'links': {
            'POST': {
                'href': '/sessions/check/commands',
            },
            'GET': {
                'href': '/sessions/check',
            },
            'DELETE': {
                'href': '/sessions/check',
            },
        }
    }
    assert response.status_code == 200


def test_get_sessions_no_sessions(api_client):
    response = api_client.get("/sessions")
    assert response.json() == {
        'data': [],
    }
    assert response.status_code == 200


def test_get_sessions(api_client, session_manager_with_session,
                      session_hardware_info):
    response = api_client.get("/sessions")
    assert response.json() == {
        'data': [session_hardware_info],
    }
    assert response.status_code == 200


def command(command_type: str, body: typing.Optional[BaseModel]):
    """Helper to create command"""
    return {
        "data": {
            "type": "SessionCommand",
            "attributes": {
                "command": command_type,
                "data": body.dict(exclude_unset=True) if body else None
            }
        }
    }


def test_session_command_create_no_session(api_client):
    response = api_client.post(
        "/sessions/1234/commands",
        json=command("jog",
                     JogPosition(vector=[1, 2, 3])))
    assert response.json() == {
        'errors': [{
            'detail': "Cannot find session with id '1234'.",
            'links': {'POST': '/sessions'},
            'status': '404',
            'title': 'No session'
        }]
    }
    assert response.status_code == 404


def test_session_command_create(api_client,
                                session_manager_with_session,
                                mock_cal_session,
                                session_hardware_info):
    response = api_client.post(
        "/sessions/check/commands",
        json=command("jog",
                     JogPosition(vector=[1, 2, 3])))

    mock_cal_session.trigger_transition.assert_called_once_with(
        trigger="jog",
        vector=[1.0, 2.0, 3.0])

    assert response.json() == {
        'data': {
            'attributes': {
                'command': 'jog',
                'data': {'vector': [1.0, 2.0, 3.0]},
                'status': 'accepted'
            },
            'type': 'SessionCommand',
            'id': response.json()['data']['id']
        },
        'meta': session_hardware_info['attributes'],
        'links': {
            'POST': {
                'href': '/sessions/check/commands',
            },
            'GET': {
                'href': '/sessions/check',
            },
            'DELETE': {
                'href': '/sessions/check',
            },
        }
    }
    assert response.status_code == 200


def test_session_command_create_no_body(api_client,
                                        session_manager_with_session,
                                        mock_cal_session,
                                        session_hardware_info):
    response = api_client.post(
        "/sessions/check/commands",
        json=command("loadLabware", None)
    )

    mock_cal_session.trigger_transition.assert_called_once_with(
        trigger="loadLabware")

    assert response.json() == {
        'data': {
            'attributes': {
                'command': 'loadLabware',
                'data': None,
                'status': 'accepted'
            },
            'type': 'SessionCommand',
            'id': response.json()['data']['id']
        },
        'meta': session_hardware_info['attributes'],
        'links': {
            'POST': {
                'href': '/sessions/check/commands',
            },
            'GET': {
                'href': '/sessions/check',
            },
            'DELETE': {
                'href': '/sessions/check',
            },
        }
    }
    assert response.status_code == 200


def test_session_command_create_raise(api_client,
                                      session_manager_with_session,
                                      mock_cal_session):

    async def raiser(*args, **kwargs):
        raise AssertionError("Cannot do it")

    mock_cal_session.trigger_transition.side_effect = raiser

    response = api_client.post(
        "/sessions/check/commands",
        json=command("jog",
                     JogPosition(vector=[1, 2, 3])))

    assert response.json() == {
        'errors': [
            {
                'detail': 'Cannot do it',
                'status': '400',
                'title': 'Exception'
            }
        ]
    }
    assert response.status_code == 400
