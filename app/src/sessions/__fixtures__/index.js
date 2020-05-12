// @flow

import * as Types from '../types'
import * as Constants from '../constants'
import { POST, DELETE, GET } from '../../robot-api'
import {
  makeResponseFixtures,
  mockV2ErrorResponse,
} from '../../robot-api/__fixtures__'

import type { RobotApiV2ErrorResponseBody } from '../../robot-api/types'

export const mockSessionData: Types.SessionData = {
  sessionType: 'calibrationCheck',
  sessionId: '1234',
  details: { someData: 5 },
}

export const mockSessionCommand: Types.SessionCommand = {
  command: 'dosomething',
  data: { someData: 32 },
}

export const mockSessionCommandData: Types.SessionCommandData = {
  command: '4321',
  status: 'accepted',
  data: {},
}

export const mockSessionResponse: Types.SessionResponse = {
  data: {
    id: mockSessionData.sessionId,
    type: 'Session',
    attributes: mockSessionData,
  },
}

export const mockSessionCommandResponse: Types.SessionCommandResponse = {
  data: {
    id: '4321',
    type: 'Command',
    attributes: mockSessionCommandData,
  },
  meta: {
    sessionType: 'calibrationCheck',
    sessionId: '1234',
    details: {
      someData: 15,
      someOtherData: 'hi',
    },
  },
}

export const {
  successMeta: mockCreateSessionSuccessMeta,
  failureMeta: mockCreateSessionFailureMeta,
  success: mockCreateSessionSuccess,
  failure: mockCreateSessionFailure,
} = makeResponseFixtures<Types.SessionResponse, RobotApiV2ErrorResponseBody>({
  method: POST,
  path: Constants.SESSIONS_PATH,
  successStatus: 201,
  successBody: mockSessionResponse,
  failureStatus: 500,
  failureBody: mockV2ErrorResponse,
})

export const {
  successMeta: mockDeleteSessionSuccessMeta,
  failureMeta: mockDeleteSessionFailureMeta,
  success: mockDeleteSessionSuccess,
  failure: mockDeleteSessionFailure,
} = makeResponseFixtures<Types.SessionResponse, RobotApiV2ErrorResponseBody>({
  method: DELETE,
  path: `${Constants.SESSIONS_PATH}/1234`,
  successStatus: 200,
  successBody: mockSessionResponse,
  failureStatus: 500,
  failureBody: mockV2ErrorResponse,
})

export const {
  successMeta: mockFetchSessionSuccessMeta,
  failureMeta: mockFetchSessionFailureMeta,
  success: mockFetchSessionSuccess,
  failure: mockFetchSessionFailure,
} = makeResponseFixtures<Types.SessionResponse, RobotApiV2ErrorResponseBody>({
  method: GET,
  path: `${Constants.SESSIONS_PATH}/1234`,
  successStatus: 200,
  successBody: mockSessionResponse,
  failureStatus: 500,
  failureBody: mockV2ErrorResponse,
})

export const {
  successMeta: mockUpdateSessionSuccessMeta,
  failureMeta: mockUpdateSessionFailureMeta,
  success: mockUpdateSessionSuccess,
  failure: mockUpdateSessionFailure,
} = makeResponseFixtures<
  Types.SessionCommandResponse,
  RobotApiV2ErrorResponseBody
>({
  method: GET,
  path: `${Constants.SESSIONS_PATH}/1234/${Constants.SESSIONS_UPDATE_PATH_EXTENSION}`,
  successStatus: 200,
  successBody: mockSessionCommandResponse,
  failureStatus: 500,
  failureBody: mockV2ErrorResponse,
})
