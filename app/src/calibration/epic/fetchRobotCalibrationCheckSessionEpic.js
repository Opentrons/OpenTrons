// @flow
import { of } from 'rxjs'
import { filter, switchMap, tap } from 'rxjs/operators'
import { ofType } from 'redux-observable'

import * as Sessions from '../../sessions'

import type { Epic } from '../../types'

import { SESSION_TYPE_CALIBRATION_CHECK } from '../constants'

export const fetchRobotCalibrationCheckSessionEpic: Epic = (
  action$,
  state$
) => {
  return action$.pipe(
    ofType(Sessions.FETCH_SESSION_FAILURE),
    filter(
      action => action.meta.response.status === 404
      // TODO: BC: un comment this once the sessionType is returned from a failed response
      // && action.payload.error.sessionType === SESSION_TYPE_CALIBRATION_CHECK
    ),
    switchMap(action =>
      of(
        Sessions.createSession(
          action.payload.robotName,
          SESSION_TYPE_CALIBRATION_CHECK
        )
      )
    )
  )
}
