// @flow
import type { State } from '../types'
import * as Types from './types'

export const getRobotSessions: (
  state: State,
  robotName: string,
) => Types.SessionsById | null = (state, robotName) =>
  state.sessions[robotName]?.robotSessions ?? null

export const getRobotSessionById: (
  state: State,
  robotName: string,
  sessionId: string
) => Types.RobotSessionData | null = (state, robotName, sessionId) =>
  getRobotSessions(state, robotName)[sessionId] ?? null

// export const getRobotSessionsByType: (
//   state: State,
//   robotName: string,
//   sessionType: Types.SessionType,
// ) => Types.SessionsById | null = (state, robotName, sessionType) =>
//   map(getRobotSessions(state, robotName)) ?? null
