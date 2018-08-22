// @flow
// API client for getting reset options and resetting robot config files
import {createSelector, type Selector} from 'reselect'

import type {State, ThunkPromiseAction} from '../types'
import type {BaseRobot, RobotService} from '../robot'
import type {ApiCall, ApiRequestError} from './types'
import type {ApiAction} from './actions'

import {apiRequest, apiSuccess, apiFailure, clearApiResponse} from './actions'
import {getRobotApiState} from './reducer'
import client from './client'

type Id = string

export type Option = {
  id: Id,
  name: string,
  description: string,
}

type FetchResetOptionsResponse = Array<Option>

export type ResetRobotRequest = {
  [Id]: boolean,
}

type ResetRobotSuccess = {|
  type: 'api:SERVER_SUCCESS',
  payload: {|
    robot: RobotService,
    path: string,
  |}
|}

type FetchResetOptionsCall = ApiCall<null, FetchResetOptionsResponse>

export type OptionsState = {
  [robotName: string]: ?FetchResetOptionsCall,
}

export const OPTIONS_PATH: 'settings/reset/options' = 'settings/reset/options'
export const RESET_PATH: 'settings/reset' = 'settings/reset'

export type ResetAction =
  | ApiAction<'settings/reset/options', null, FetchResetOptionsResponse>

export function fetchResetOptions (robot: RobotService): ThunkPromiseAction {
  return (dispatch) => {
    dispatch(apiRequest(robot, OPTIONS_PATH, null))

    return client(robot, 'GET', OPTIONS_PATH)
      .then(
        (resp) => apiSuccess(robot, OPTIONS_PATH, resp),
        (err: ApiRequestError) => apiFailure(robot, OPTIONS_PATH, err)
      )
      .then(dispatch)
  }
}

export function makeGetRobotResetOptions () {
  const selector: Selector<State, BaseRobot, FetchResetOptionsCall> = createSelector(
    getRobotApiState,
    (state) => state[OPTIONS_PATH] || {inProgress: false}
  )

  return selector
}

export function resetRobotData (robot: RobotService, options: ResetRobotRequest): ThunkPromiseAction {
  const request: ResetRobotRequest = options
  return (dispatch) => {
    dispatch(apiRequest(robot, RESET_PATH, request))

    return client(robot, 'POST', RESET_PATH, request)
      .then(
        (resp: ResetRobotSuccess) => apiSuccess(robot, RESET_PATH, resp),
        (err: ApiRequestError) => apiFailure(robot, RESET_PATH, err)
      )
      .then(dispatch)
  }
}

export function clearResetResponse (robot: RobotService): ThunkPromiseAction {
  return (dispatch) => {
    return dispatch(clearApiResponse(robot, RESET_PATH))
  }
}

export function makeGetRobotResetRequest () {
  const selector: Selector<State, BaseRobot, ResetRobotRequest> = createSelector(
    getRobotApiState,
    (state) => state[RESET_PATH] || {inProgress: false}
  )
  return selector
}
