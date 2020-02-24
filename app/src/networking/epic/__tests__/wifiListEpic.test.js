// @flow
import {
  setupEpicTestMocks,
  scheduleEpicTest,
} from '../../../robot-api/__utils__'
import * as Fixtures from '../../__fixtures__'
import * as Actions from '../../actions'
import { networkingEpic } from '..'

describe('networking wifiListEpic', () => {
  let mocks

  beforeEach(() => {
    mocks = setupEpicTestMocks(robotName => Actions.fetchWifiList(robotName))
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('calls GET /wifi/list', () => {
    scheduleEpicTest(
      mocks,
      Fixtures.mockWifiListSuccess,
      ({ hot, expectObservable, flush }) => {
        const action$ = hot('--a', { a: mocks.action })
        const state$ = hot('s-s', { s: mocks.state })
        const output$ = networkingEpic(action$, state$)

        expectObservable(output$)
        flush()

        expect(mocks.fetchRobotApi).toHaveBeenCalledWith(mocks.robot, {
          method: 'GET',
          path: '/wifi/list',
        })
      }
    )
  })

  it('maps successful response to FETCH_WIFI_LIST_SUCCESS', () => {
    scheduleEpicTest(
      mocks,
      Fixtures.mockWifiListSuccess,
      ({ hot, expectObservable }) => {
        const action$ = hot('--a', { a: mocks.action })
        const state$ = hot('s-s', { s: mocks.state })
        const output$ = networkingEpic(action$, state$)

        expectObservable(output$).toBe('--a', {
          a: Actions.fetchWifiListSuccess(
            mocks.robot.name,
            Fixtures.mockWifiListSuccess.body.list,
            { ...mocks.meta, response: Fixtures.mockWifiListSuccessMeta }
          ),
        })
      }
    )
  })

  it('maps failed response to FETCH_WIFI_LIST_FAILURE', () => {
    scheduleEpicTest(
      mocks,
      Fixtures.mockWifiListFailure,
      ({ hot, expectObservable }) => {
        const action$ = hot('--a', { a: mocks.action })
        const state$ = hot('s-s', { s: mocks.state })
        const output$ = networkingEpic(action$, state$)

        expectObservable(output$).toBe('--a', {
          a: Actions.fetchWifiListFailure(
            mocks.robot.name,
            Fixtures.mockWifiListFailure.body,
            { ...mocks.meta, response: Fixtures.mockWifiListFailureMeta }
          ),
        })
      }
    )
  })
})
