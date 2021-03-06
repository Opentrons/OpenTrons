import { connect } from 'react-redux'
import {
  WellSelectionInput,
  Props as WellSelectionInputProps,
  DP,
} from './WellSelectionInput'
import { selectors as stepFormSelectors } from '../../../../step-forms'
import { BaseState } from '../../../../types'
import { FieldProps } from '../../types'

type Props = Omit<
  JSX.LibraryManagedAttributes<
    typeof WellSelectionInput,
    WellSelectionInputProps
  >,
  keyof DP
>
type OP = FieldProps & {
  labwareId?: string | null
  pipetteId?: string | null
}
interface SP {
  isMulti: Props['isMulti']
  primaryWellCount: Props['primaryWellCount']
}

const mapStateToProps = (state: BaseState, ownProps: OP): SP => {
  const { pipetteId } = ownProps
  const selectedWells = ownProps.value
  const pipette =
    pipetteId && stepFormSelectors.getPipetteEntities(state)[pipetteId]
  const isMulti = pipette ? pipette.spec.channels > 1 : false
  return {
    primaryWellCount: Array.isArray(selectedWells)
      ? selectedWells.length
      : undefined,
    isMulti,
  }
}

function mergeProps(stateProps: SP, _dispatchProps: null, ownProps: OP): Props {
  const {
    disabled,
    errorToShow,
    labwareId,
    name,
    onFieldBlur,
    onFieldFocus,
    pipetteId,
    updateValue,
    value,
  } = ownProps
  return {
    disabled,
    errorToShow,
    isMulti: stateProps.isMulti,
    labwareId,
    name,
    onFieldBlur,
    onFieldFocus,
    pipetteId,
    primaryWellCount: stateProps.primaryWellCount,
    updateValue,
    value,
  }
}

export const WellSelectionField = connect(
  mapStateToProps,
  null,
  mergeProps
)(WellSelectionInput)
