// @flow
import {connect} from 'react-redux'
import assert from 'assert'
import LabwareDetailsCard from './LabwareDetailsCard'
import {selectors as stepFormSelectors} from '../../../step-forms'
import {selectors as labwareIngredSelectors} from '../../../labware-ingred/selectors'
import * as labwareIngredActions from '../../../labware-ingred/actions'
import type {ElementProps} from 'react'
import type {Dispatch} from 'redux'
import type {BaseState} from '../../../types'

type Props = ElementProps<typeof LabwareDetailsCard>

type DP = {
  renameLabware: $PropertyType<Props, 'renameLabware'>,
}

type SP = $Diff<Props, DP> & {_labwareId: ?string}

function mapStateToProps (state: BaseState): SP {
  const labwareId = labwareIngredSelectors.getSelectedLabwareId(state)
  const labwareEntities = stepFormSelectors.getLabwareEntities(state)
  const labwareNicknamesById = stepFormSelectors.getLabwareNicknamesById(state)
  assert(labwareId, 'Expected labware id to exist in connected labware details card')

  const props = (labwareId)
    ? {
      labwareType: labwareEntities[labwareId] && labwareEntities[labwareId].type,
      nickname: labwareNicknamesById[labwareId] || 'Unnamed Labware',
    }
    : {
      labwareType: '?',
      nickname: '?',
    }

  return {
    ...props,
    _labwareId: labwareId,
  }
}

function mergeProps (stateProps: SP, dispatchProps: {dispatch: Dispatch<*>}): Props {
  const dispatch = dispatchProps.dispatch
  const {_labwareId, ...passThruProps} = stateProps

  const renameLabware = (name: string) => {
    assert(_labwareId, 'renameLabware in LabwareDetailsCard expected a labwareId')
    if (_labwareId) {
      dispatch(
        labwareIngredActions.renameLabware({labwareId: _labwareId, name})
      )
    }
  }

  return {
    ...passThruProps,
    renameLabware,
  }
}

export default connect(mapStateToProps, null, mergeProps)(LabwareDetailsCard)
