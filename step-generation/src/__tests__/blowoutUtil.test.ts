import { BlowoutParams } from '@opentrons/shared-data/protocol/types/schemaV3'
import { blowout } from '../commandCreators/atomic/blowout'
import { InvariantContext } from '../types'
import {
  blowoutUtil,
  SOURCE_WELL_BLOWOUT_DESTINATION,
  DEST_WELL_BLOWOUT_DESTINATION,
} from '../utils'
import { curryCommandCreator } from '../utils/curryCommandCreator'
import {
  DEFAULT_PIPETTE,
  SOURCE_LABWARE,
  DEST_LABWARE,
  TROUGH_LABWARE,
  BLOWOUT_FLOW_RATE,
  BLOWOUT_OFFSET_FROM_TOP_MM,
  makeContext,
} from '../fixtures'
jest.mock('../utils/curryCommandCreator')

const curryCommandCreatorMock = curryCommandCreator as jest.MockedFunction<
  typeof curryCommandCreator
>

let blowoutArgs: {
  pipette: BlowoutParams['pipette']
  sourceLabwareId: string
  sourceWell: BlowoutParams['well']
  destLabwareId: string
  destWell: BlowoutParams['well']
  blowoutLocation: string | null | undefined
  flowRate: number
  offsetFromTopMm: number
  invariantContext: InvariantContext
}
describe('blowoutUtil', () => {
  beforeEach(() => {
    blowoutArgs = {
      pipette: DEFAULT_PIPETTE,
      sourceLabwareId: SOURCE_LABWARE,
      sourceWell: 'A1',
      destLabwareId: DEST_LABWARE,
      destWell: 'A2',
      flowRate: BLOWOUT_FLOW_RATE,
      offsetFromTopMm: BLOWOUT_OFFSET_FROM_TOP_MM,
      invariantContext: makeContext(),
      blowoutLocation: null,
    }
    curryCommandCreatorMock.mockClear()
  })
  it('blowoutUtil curries blowout with source well params', () => {
    blowoutUtil({
      ...blowoutArgs,
      blowoutLocation: SOURCE_WELL_BLOWOUT_DESTINATION,
    })
    expect(curryCommandCreatorMock).toHaveBeenCalledWith(blowout, {
      pipette: blowoutArgs.pipette,
      labware: blowoutArgs.sourceLabwareId,
      well: blowoutArgs.sourceWell,
      flowRate: blowoutArgs.flowRate,
      offsetFromBottomMm: expect.any(Number),
    })
  })
  it('blowoutUtil curries blowout with dest plate params', () => {
    blowoutUtil({
      ...blowoutArgs,
      blowoutLocation: DEST_WELL_BLOWOUT_DESTINATION,
    })
    expect(curryCommandCreatorMock).toHaveBeenCalledWith(blowout, {
      pipette: blowoutArgs.pipette,
      labware: blowoutArgs.destLabwareId,
      well: blowoutArgs.destWell,
      flowRate: blowoutArgs.flowRate,
      offsetFromBottomMm: expect.any(Number),
    })
  })
  it('blowoutUtil curries blowout with an arbitrary labware Id', () => {
    blowoutUtil({ ...blowoutArgs, blowoutLocation: TROUGH_LABWARE })
    expect(curryCommandCreatorMock).toHaveBeenCalledWith(blowout, {
      pipette: blowoutArgs.pipette,
      labware: TROUGH_LABWARE,
      well: 'A1',
      flowRate: blowoutArgs.flowRate,
      offsetFromBottomMm: expect.any(Number),
    })
  })
  it('blowoutUtil returns an empty array if not given a blowoutLocation', () => {
    const result = blowoutUtil({ ...blowoutArgs, blowoutLocation: null })
    expect(curryCommandCreatorMock).not.toHaveBeenCalled()
    expect(result).toEqual([])
  })
})
