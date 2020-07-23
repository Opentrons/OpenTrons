// @flow

import typeof {
  DECK_CAL_STATUS_OK,
  DECK_CAL_STATUS_IDENTITY,
  DECK_CAL_STATUS_BAD_CALIBRATION,
  DECK_CAL_STATUS_SINGULARITY,
} from './constants'

export type DeckCalibrationStatus =
  | DECK_CAL_STATUS_OK
  | DECK_CAL_STATUS_IDENTITY
  | DECK_CAL_STATUS_BAD_CALIBRATION
  | DECK_CAL_STATUS_SINGULARITY

export type CalibrationStatus = {|
  deckCalibration: {|
    status: DeckCalibrationStatus,
    data: [
      [number, number, number, number],
      [number, number, number, number],
      [number, number, number, number],
      [number, number, number, number]
    ],
  |},
  instrumentCalibration: {|
    right: {|
      single: [number, number, number],
      multi: [number, number, number],
    |},
    left: {|
      single: [number, number, number],
      multi: [number, number, number],
    |},
  |},
|}

export type OffsetData = {|
  value: Array<number>,
  lastModified: string,
|}

export type TipLengthData = {|
  value: number,
  lastModified: string,
|}

export type CalibrationData = {|
  offset: OffsetData,
  tipLength: TipLengthData | null,
|}

export type SingleLabwareCalibration = {|
  calibrationData: CalibrationData,
  loadName: string,
  namespace: string,
  version: number,
  parent: string,
|}

export type LabwareCalibrationObjects = {|
  attributes: SingleLabwareCalibration,
  type: string,
  id: string,
|}

export type AllLabwareCalibrations = {|
  data: Array<LabwareCalibrationObjects | null>,
  meta: Object,
|}
