PIPETTE_ID = '123'
LW_HASH = '130e17bb7b2f0c0472dcc01c1ff6f600ca1a6f9f86a90982df56c4bf43776824'
FAKE_PIPETTE_ID = 'fake_pip'
WRONG_LW_HASH = 'wronghash'


def test_access_tip_length_calibration(
        api_client, set_up_tip_length_temp_directory):
    expected = {
        'id': f'{LW_HASH}&{PIPETTE_ID}',
        'tipLength': 30.5,
        'pipette': PIPETTE_ID,
        'tiprack': LW_HASH,
        'lastModified': None,
        'source': 'unknown',
        'status': {
            'markedAt': None, 'markedBad': False, 'source': None}
    }

    resp = api_client.get(
        f'/calibration/tip_length?pipette_id={PIPETTE_ID}&'
        f'tiprack_hash={LW_HASH}')
    assert resp.status_code == 200
    data = resp.json()['data'][0]
    data['lastModified'] = None
    assert data == expected

    resp = api_client.get(
        f'/calibration/tip_length?pipette_id={FAKE_PIPETTE_ID}&'
        f'tiprack_hash={WRONG_LW_HASH}')
    assert resp.status_code == 200
    assert resp.json()['data'] == []


def test_delete_tip_length_calibration(
        api_client, set_up_pipette_offset_temp_directory):
    resp = api_client.delete(
        f'/calibration/tip_length?pipette_id={FAKE_PIPETTE_ID}&'
        f'tiprack_hash={WRONG_LW_HASH}')
    assert resp.status_code == 404
    body = resp.json()
    assert body == {
        'errors': [{
            'status': '404',
            'title': 'Resource Not Found',
            'detail': "Resource type 'TipLengthCalibration' with id "
                      "'wronghash&fake_pip' was not found"
        }]}

    resp = api_client.delete(
        f'/calibration/tip_length?pipette_id={PIPETTE_ID}&'
        f'tiprack_hash={LW_HASH}')
    assert resp.status_code == 200
