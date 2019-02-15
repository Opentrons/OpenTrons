// @flow
// robot settings endpoints
import {createSelector} from 'reselect'

import {buildRequestMaker} from './actions'
import {getRobotApiState} from './reducer'

import type {OutputSelector} from 'reselect'
import type {State} from '../types'
import type {BaseRobot} from '../robot'
import type {ApiCall} from './types'
import type {ApiAction, RequestMaker} from './actions'
import type {RobotApiState} from './reducer'

type Id = string

// TODO(mc, 2018-07-02): support more value types
type Value = boolean | null

export type Setting = {
  id: Id,
  title: string,
  description: string,
  value: Value,
}

type SettingsRequest = ?{id: Id, value: Value}

type SettingsResponse = {settings: Array<Setting>}

export type SettingsAction = ApiAction<'settings',
  SettingsRequest,
  SettingsResponse>

export type RobotSettingsCall = ApiCall<SettingsRequest, SettingsResponse>

export type SettingsState = {|
  settings?: RobotSettingsCall,
|}

const SETTINGS: 'settings' = 'settings'

type SettingsRequestMaker = RequestMaker<SettingsRequest>

export const fetchSettings: SettingsRequestMaker = buildRequestMaker(
  'GET',
  SETTINGS
)

export const setSettings: SettingsRequestMaker = buildRequestMaker(
  'POST',
  SETTINGS
)

export function makeGetRobotSettings () {
  const selector: OutputSelector<State,
    BaseRobot,
    RobotSettingsCall> = createSelector(
      getRobotApiState,
      getSettingsRequest
    )

  return selector
}

export function getSettingsRequest (state: RobotApiState): RobotSettingsCall {
  let requestState = state[SETTINGS] || {inProgress: false}

  // guard against an older version of GET /settings
  if (requestState.response && !('settings' in requestState.response)) {
    requestState = {...requestState, response: {settings: []}}
  }

  return requestState
}
