// @flow
import * as React from 'react'
import {getWellTotalVolume} from '@opentrons/shared-data'
import KnowledgeBaseLink from '../../components/KnowledgeBaseLink'
import type {FormError} from './errors'
/*******************
** Warning Messages **
********************/

export type FormWarningType =
  | 'BELOW_PIPETTE_MINIMUM_VOLUME'
  | 'OVER_MAX_WELL_VOLUME'
  | 'BELOW_MIN_DISPOSAL_VOLUME'

export type FormWarning = {
  ...$Exact<FormError>,
  type: FormWarningType,
}
// TODO: Ian 2018-12-06 use i18n for title/body text
const FORM_WARNINGS: {[FormWarningType]: FormWarning} = {
  BELOW_PIPETTE_MINIMUM_VOLUME: {
    type: 'BELOW_PIPETTE_MINIMUM_VOLUME',
    title: 'Specified volume is below pipette minimum',
    dependentFields: ['pipette', 'volume'],
  },
  OVER_MAX_WELL_VOLUME: {
    type: 'OVER_MAX_WELL_VOLUME',
    title: 'Dispense volume will overflow a destination well',
    dependentFields: ['dispense_labware', 'dispense_wells', 'volume'],
  },
  BELOW_MIN_DISPOSAL_VOLUME: {
    type: 'BELOW_MIN_DISPOSAL_VOLUME',
    title: 'Below Recommended disposal volume',
    body: (
      <React.Fragment>
        For accuracy in multi-dispense actions we recommend you use a disposal volume of at least the pipette&apos;s minimum.
        Read more <KnowledgeBaseLink to='distribute'>here</KnowledgeBaseLink>.
      </React.Fragment>
    ),
    dependentFields: ['disposalVol_volume', 'pipette'],
  },
}
export type WarningChecker = (mixed) => ?FormWarning

// TODO: test these
/*******************
** Warning Checkers **
********************/
// TODO: real HydratedFormData type
type HydratedFormData = any

export const belowPipetteMinimumVolume = (fields: HydratedFormData): ?FormWarning => {
  const {pipette, volume} = fields
  if (!(pipette && pipette.spec)) return null
  return volume < pipette.spec.minVolume ? FORM_WARNINGS.BELOW_PIPETTE_MINIMUM_VOLUME : null
}

export const maxDispenseWellVolume = (fields: HydratedFormData): ?FormWarning => {
  const {dispense_labware, dispense_wells, volume} = fields
  if (!dispense_labware || !dispense_wells) return null
  const hasExceeded = dispense_wells.some(well => {
    const maximum = getWellTotalVolume(dispense_labware.type, well)
    return maximum && (volume > maximum)
  })
  return hasExceeded ? FORM_WARNINGS.OVER_MAX_WELL_VOLUME : null
}

export const minDisposalVolume = (fields: HydratedFormData): ?FormWarning => {
  const {disposalVol_checkbox, disposalVol_volume, pipette} = fields
  if (!(pipette && pipette.spec)) return null
  const isUnselected = !disposalVol_checkbox || !disposalVol_volume
  if (isUnselected) return FORM_WARNINGS.BELOW_MIN_DISPOSAL_VOLUME
  const isBelowMin = disposalVol_volume < (pipette.spec.minVolume)
  return isBelowMin ? FORM_WARNINGS.BELOW_MIN_DISPOSAL_VOLUME : null
}

/*******************
**     Helpers    **
********************/

export const composeWarnings = (...warningCheckers: Array<WarningChecker>) => (formData: mixed): Array<FormWarning> => (
  warningCheckers.reduce((acc, checker) => {
    const possibleWarning = checker(formData)
    return possibleWarning ? [...acc, possibleWarning] : acc
  }, [])
)
