// @flow
import * as React from 'react'
import {FormGroup} from '@opentrons/components'

import {
  StepInputField,
  StepCheckboxRow,
  DispenseDelayFields,
  PipetteField,
  LabwareDropdown,
  ChangeTipField,
  FlowRateField,
  TipPositionField
} from './formFields'

import WellSelectionInput from './WellSelectionInput'
import type {StepType} from '../../form-types'
import formStyles from '../forms.css'
import styles from './StepEditForm.css'
import FormSection from './FormSection'
import type {FocusHandlers} from './index'

type TransferLikeFormProps = {focusHandlers: FocusHandlers, stepType: StepType}

const TransferLikeForm = (props: TransferLikeFormProps) => {
  const {focusHandlers, stepType} = props
  return (
    <React.Fragment>
      <FormSection sectionName="aspirate">
        <div className={formStyles.row_wrapper}>
          <FormGroup label="Labware:" className={styles.labware_field}>
            <LabwareDropdown name="aspirate_labware" {...focusHandlers} />
          </FormGroup>
          {/* TODO LATER: also 'disable' when selected labware is a trash */}
          <WellSelectionInput
            name="aspirate_wells"
            labwareFieldName="aspirate_labware"
            pipetteFieldName="pipette"
            {...focusHandlers} />
          <PipetteField name="pipette" stepType={stepType} {...focusHandlers} />
          {stepType === 'consolidate' &&
            <FormGroup label='Volume:' className={styles.volume_field}>
              <StepInputField name="volume" units='μL' {...focusHandlers} />
            </FormGroup>}
        </div>

        <div className={formStyles.row_wrapper}>
          <div className={styles.left_settings_column}>
            <FormGroup label='TECHNIQUE'>
              <StepCheckboxRow name="aspirate_preWetTip" label="Pre-wet tip" />
              <StepCheckboxRow name="aspirate_touchTip" label="Touch tip" />
              <StepCheckboxRow name="aspirate_airGap_checkbox" label="Air Gap">
                <StepInputField name="aspirate_airGap_volume" units="μL" {...focusHandlers} />
              </StepCheckboxRow>
              <StepCheckboxRow name="aspirate_mix_checkbox" label='Mix'>
                <StepInputField name="aspirate_mix_volume" units='μL' {...focusHandlers} />
                <StepInputField name="aspirate_mix_times" units='Times' {...focusHandlers} />
              </StepCheckboxRow>
              <StepCheckboxRow name="aspirate_disposalVol_checkbox" label="Disposal Volume" >
                <StepInputField name="aspirate_disposalVol_volume" units="μL" {...focusHandlers} />
              </StepCheckboxRow>
            </FormGroup>
          </div>
          <div className={styles.right_settings_column}>
            <ChangeTipField name="aspirate_changeTip" />
            <FlowRateField />
            <TipPositionField />
          </div>
        </div>
      </FormSection>

      <FormSection sectionName='dispense'>
        <div className={formStyles.row_wrapper}>
          <FormGroup label='Labware:' className={styles.labware_field}>
            <LabwareDropdown name="dispense_labware" {...focusHandlers} />
          </FormGroup>
          <WellSelectionInput
            name="dispense_wells"
            labwareFieldName="dispense_labware"
            pipetteFieldName="pipette"
            {...focusHandlers} />
          {(stepType === 'transfer' || stepType === 'distribute') &&
            <FormGroup label='Volume:' className={styles.volume_field}>
              <StepInputField name="volume" units="μL" {...focusHandlers} />
            </FormGroup>}
        </div>

        <div className={formStyles.row_wrapper}>
          <div className={styles.left_settings_column}>
            <FormGroup label='TECHNIQUE'>
              <StepCheckboxRow name="dispense_mix_checkbox" label='Mix'>
                <StepInputField name="dispense_mix_volume" units="μL" {...focusHandlers} />
                <StepInputField name="dispense_mix_times" units="Times" {...focusHandlers} />
              </StepCheckboxRow>
              <DispenseDelayFields focusHandlers={focusHandlers} />
              <StepCheckboxRow name='dispense_blowout_checkbox' label='Blow out' >
                <LabwareDropdown name="dispense_blowout_labware" className={styles.full_width} {...focusHandlers} />
              </StepCheckboxRow>
            </FormGroup>
          </div>
          <div className={styles.right_settings_column}>
            <FlowRateField />
            <TipPositionField />
          </div>
        </div>
      </FormSection>
    </React.Fragment>
  )
}

export default TransferLikeForm
