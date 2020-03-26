// @flow
import type { RobotApiRequestMeta } from '../robot-api/types'
import typeof {
  FETCH_ROBOT_CALIBRATION_CHECK_SESSION,
  FETCH_ROBOT_CALIBRATION_CHECK_SESSION_SUCCESS,
  FETCH_ROBOT_CALIBRATION_CHECK_SESSION_FAILURE,
  DELETE_ROBOT_CALIBRATION_CHECK_SESSION,
  DELETE_ROBOT_CALIBRATION_CHECK_SESSION_SUCCESS,
  DELETE_ROBOT_CALIBRATION_CHECK_SESSION_FAILURE,
  COMPLETE_ROBOT_CALIBRATION_CHECK,
} from './constants'
import type { RobotCalibrationCheckSessionData } from './api-types'

export type FetchRobotCalibrationCheckSessionAction = {|
  type: FETCH_ROBOT_CALIBRATION_CHECK_SESSION,
  payload: {| robotName: string |},
  meta: RobotApiRequestMeta,
|}

export type FetchRobotCalibrationCheckSessionSuccessAction = {|
  type: FETCH_ROBOT_CALIBRATION_CHECK_SESSION_SUCCESS,
  payload: {| robotName: string, ...RobotCalibrationCheckSessionData |},
  meta: RobotApiRequestMeta,
|}

export type FetchRobotCalibrationCheckSessionFailureAction = {|
  type: FETCH_ROBOT_CALIBRATION_CHECK_SESSION_FAILURE,
  payload: {| robotName: string, error: {} |},
  meta: RobotApiRequestMeta,
|}

export type DeleteRobotCalibrationCheckSessionAction = {|
  type: DELETE_ROBOT_CALIBRATION_CHECK_SESSION,
  payload: {| robotName: string |},
  meta: RobotApiRequestMeta,
|}

export type DeleteRobotCalibrationCheckSessionSuccessAction = {|
  type: DELETE_ROBOT_CALIBRATION_CHECK_SESSION_SUCCESS,
  payload: {| robotName: string |},
  meta: RobotApiRequestMeta,
|}

export type DeleteRobotCalibrationCheckSessionFailureAction = {|
  type: DELETE_ROBOT_CALIBRATION_CHECK_SESSION_FAILURE,
  payload: {| robotName: string, error: {} |},
  meta: RobotApiRequestMeta,
|}

export type CompleteRobotCalibrationCheckAction = {|
  type: COMPLETE_ROBOT_CALIBRATION_CHECK,
  payload: {| robotName: string |},
|}

export type CalibrationAction =
  | FetchRobotCalibrationCheckSessionAction
  | FetchRobotCalibrationCheckSessionSuccessAction
  | FetchRobotCalibrationCheckSessionFailureAction
  | DeleteRobotCalibrationCheckSessionAction
  | DeleteRobotCalibrationCheckSessionSuccessAction
  | DeleteRobotCalibrationCheckSessionFailureAction
  | CompleteRobotCalibrationCheckAction

export type PerRobotCalibrationState = $ReadOnly<{|
  robotCalibrationCheck: RobotCalibrationCheckSessionData | null,
|}>

export type CalibrationState = $Shape<
  $ReadOnly<{|
    [robotName: string]: void | PerRobotCalibrationState,
  |}>
>
