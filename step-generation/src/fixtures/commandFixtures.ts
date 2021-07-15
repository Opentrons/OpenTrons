import { tiprackWellNamesFlat } from './data'
import type {
  AirGapParams,
  AspirateParams,
  BlowoutParams,
  DispenseParams,
  TouchTipParams,
} from '@opentrons/shared-data/protocol/types/schemaV3'
import { FIXED_TRASH_ID } from '../constants'
import type { Command } from '@opentrons/shared-data/protocol/types/schemaV6'
import type { CommandsAndWarnings, CommandCreatorErrorResponse } from '../types'

/** Used to wrap command creators in tests, effectively casting their results
 **  to normal response or error response
 **/
export function getSuccessResult(
  result: CommandsAndWarnings | CommandCreatorErrorResponse
): CommandsAndWarnings {
  if ('errors' in result) {
    throw new Error(
      `Expected a successful command creator call but got errors: ${JSON.stringify(
        result.errors
      )}`
    )
  }

  return result
}
export function getErrorResult(
  result: CommandsAndWarnings | CommandCreatorErrorResponse
): CommandCreatorErrorResponse {
  if (!('errors' in result)) {
    throw new Error(
      `Expected command creator to return errors but got success result`
    )
  }

  return result
}
export const replaceTipCommands = (tip: number | string): Command[] => [
  dropTipHelper('A1'),
  pickUpTipHelper(tip),
]
// NOTE: make sure none of these numbers match each other!
const ASPIRATE_FLOW_RATE = 2.1
const DISPENSE_FLOW_RATE = 2.2
export const BLOWOUT_FLOW_RATE = 2.3
export const ASPIRATE_OFFSET_FROM_BOTTOM_MM = 3.1
export const DISPENSE_OFFSET_FROM_BOTTOM_MM = 3.2
export const BLOWOUT_OFFSET_FROM_TOP_MM = 3.3
const TOUCH_TIP_OFFSET_FROM_BOTTOM_MM = 3.4
export interface FlowRateAndOffsetParamsTransferlike {
  aspirateFlowRateUlSec: number
  dispenseFlowRateUlSec: number
  blowoutFlowRateUlSec: number
  aspirateOffsetFromBottomMm: number
  dispenseOffsetFromBottomMm: number
  blowoutOffsetFromTopMm: number
  touchTipAfterAspirateOffsetMmFromBottom: number
  touchTipAfterDispenseOffsetMmFromBottom: number
}
export const getFlowRateAndOffsetParamsTransferLike = (): FlowRateAndOffsetParamsTransferlike => ({
  aspirateFlowRateUlSec: ASPIRATE_FLOW_RATE,
  dispenseFlowRateUlSec: DISPENSE_FLOW_RATE,
  blowoutFlowRateUlSec: BLOWOUT_FLOW_RATE,
  aspirateOffsetFromBottomMm: ASPIRATE_OFFSET_FROM_BOTTOM_MM,
  dispenseOffsetFromBottomMm: DISPENSE_OFFSET_FROM_BOTTOM_MM,
  blowoutOffsetFromTopMm: BLOWOUT_OFFSET_FROM_TOP_MM,
  // for consolidate/distribute/transfer only
  touchTipAfterAspirateOffsetMmFromBottom: TOUCH_TIP_OFFSET_FROM_BOTTOM_MM,
  touchTipAfterDispenseOffsetMmFromBottom: TOUCH_TIP_OFFSET_FROM_BOTTOM_MM,
})
interface FlowRateAndOffsetParamsMix {
  aspirateFlowRateUlSec: number
  dispenseFlowRateUlSec: number
  blowoutFlowRateUlSec: number
  aspirateOffsetFromBottomMm: number
  dispenseOffsetFromBottomMm: number
  blowoutOffsetFromTopMm: number
  touchTipMmFromBottom: number
}
export const getFlowRateAndOffsetParamsMix = (): FlowRateAndOffsetParamsMix => ({
  aspirateFlowRateUlSec: ASPIRATE_FLOW_RATE,
  dispenseFlowRateUlSec: DISPENSE_FLOW_RATE,
  blowoutFlowRateUlSec: BLOWOUT_FLOW_RATE,
  aspirateOffsetFromBottomMm: ASPIRATE_OFFSET_FROM_BOTTOM_MM,
  dispenseOffsetFromBottomMm: DISPENSE_OFFSET_FROM_BOTTOM_MM,
  blowoutOffsetFromTopMm: BLOWOUT_OFFSET_FROM_TOP_MM,
  // for mix only
  touchTipMmFromBottom: TOUCH_TIP_OFFSET_FROM_BOTTOM_MM,
})
// =================
export const DEFAULT_PIPETTE = 'p300SingleId'
export const MULTI_PIPETTE = 'p300MultiId'
export const SOURCE_LABWARE = 'sourcePlateId'
export const DEST_LABWARE = 'destPlateId'
export const TROUGH_LABWARE = 'troughId'
export const DEFAULT_BLOWOUT_WELL = 'A1'

// =================
type MakeAspDispHelper<P> = (
  bakedParams?: Partial<P>
) => (well: string, volume: number, params?: Partial<P>) => Command
type MakeAirGapHelper<P> = (
  bakedParams: Partial<P> & {
    offsetFromBottomMm: number
  }
) => (well: string, volume: number, params?: Partial<P>) => Command
type MakeDispenseAirGapHelper<P> = MakeAirGapHelper<P>
const _defaultAspirateParams = {
  pipette: DEFAULT_PIPETTE,
  labware: SOURCE_LABWARE,
}
export const makeAspirateHelper: MakeAspDispHelper<AspirateParams> = bakedParams => (
  well,
  volume,
  params
) => ({
  command: 'aspirate',
  params: {
    ..._defaultAspirateParams,
    ...bakedParams,
    well,
    volume,
    offsetFromBottomMm: ASPIRATE_OFFSET_FROM_BOTTOM_MM,
    flowRate: ASPIRATE_FLOW_RATE,
    ...params,
  },
})
export const makeAirGapHelper: MakeAirGapHelper<AirGapParams> = bakedParams => (
  well,
  volume,
  params
) => ({
  command: 'airGap',
  params: {
    ..._defaultAspirateParams,
    ...bakedParams,
    well,
    volume,
    flowRate: ASPIRATE_FLOW_RATE,
    ...params,
  },
})
export const blowoutHelper = (
  labware?: string | null | undefined,
  params?: Partial<BlowoutParams>
): Command => ({
  command: 'blowout',
  params: {
    pipette: DEFAULT_PIPETTE,
    labware: labware || FIXED_TRASH_ID,
    well: DEFAULT_BLOWOUT_WELL,
    offsetFromBottomMm: BLOWOUT_OFFSET_FROM_TOP_MM,
    // TODO IMMEDIATELY
    flowRate: BLOWOUT_FLOW_RATE,
    ...params,
  },
})
const _defaultDispenseParams = {
  pipette: DEFAULT_PIPETTE,
  labware: DEST_LABWARE,
  offsetFromBottomMm: DISPENSE_OFFSET_FROM_BOTTOM_MM,
  flowRate: DISPENSE_FLOW_RATE,
}
export const makeDispenseHelper: MakeAspDispHelper<DispenseParams> = bakedParams => (
  well,
  volume,
  params
) => ({
  command: 'dispense',
  params: {
    ..._defaultDispenseParams,
    ...bakedParams,
    well,
    volume,
    ...params,
  },
})
export const makeDispenseAirGapHelper: MakeDispenseAirGapHelper<AirGapParams> = bakedParams => (
  well,
  volume,
  params
) => ({
  command: 'dispenseAirGap',
  params: {
    ..._defaultDispenseParams,
    ...bakedParams,
    well,
    volume,
    ...params,
  },
})
const _defaultTouchTipParams = {
  pipette: DEFAULT_PIPETTE,
  labware: SOURCE_LABWARE,
  offsetFromBottomMm: TOUCH_TIP_OFFSET_FROM_BOTTOM_MM,
}
type MakeTouchTipHelper = (
  bakedParams?: Partial<TouchTipParams>
) => (well: string, params?: Partial<TouchTipParams>) => Command
export const makeTouchTipHelper: MakeTouchTipHelper = bakedParams => (
  well,
  params
) => ({
  command: 'touchTip',
  params: { ..._defaultTouchTipParams, ...bakedParams, well, ...params },
})
export const delayCommand = (seconds: number): Command => ({
  command: 'delay',
  params: {
    wait: seconds,
  },
})
export const delayWithOffset = (
  well: string,
  labware: string,
  seconds?: number,
  zOffset?: number
): Command[] => [
  {
    command: 'moveToWell',
    params: {
      pipette: DEFAULT_PIPETTE,
      labware,
      well,
      offset: {
        x: 0,
        y: 0,
        z: zOffset || 14,
      },
    },
  },
  {
    command: 'delay',
    params: {
      wait: seconds || 12,
    },
  },
]
// =================
export const dropTipHelper = (
  well: string,
  params?: {
    pipette?: string
    labware?: string
  }
): Command => ({
  command: 'dropTip',
  params: {
    pipette: DEFAULT_PIPETTE,
    labware: FIXED_TRASH_ID,
    well: typeof well === 'string' ? well : tiprackWellNamesFlat[well],
    ...params,
  },
})
export const pickUpTipHelper = (
  tip: number | string,
  params?: {
    pipette?: string
    labware?: string
  }
): Command => ({
  command: 'pickUpTip',
  params: {
    pipette: DEFAULT_PIPETTE,
    labware: 'tiprack1Id',
    ...params,
    well: typeof tip === 'string' ? tip : tiprackWellNamesFlat[tip],
  },
})
