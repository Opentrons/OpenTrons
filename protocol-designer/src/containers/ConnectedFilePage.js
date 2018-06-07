// @flow
import * as React from 'react'
import type {Dispatch} from 'redux'
import {connect} from 'react-redux'
import type {BaseState} from '../types'

import FilePage from '../components/FilePage'

import {actions, selectors} from '../file-data'
import type {FileMetadataFields} from '../file-data'
import {formConnectorFactory, type FormConnector} from '../utils'

export default connect(mapStateToProps, null, mergeProps)(FilePage)

type Props = React.ElementProps<typeof FilePage>
type StateProps = {
  instruments: $PropertyType<Props, 'instruments'>,
  _values: {[string]: string}
}

function mapStateToProps (state: BaseState): StateProps {
  const formValues = selectors.fileFormValues(state)
  const isFormAltered = selectors.isUnsavedMetadatFormAltered(state)
  const pipetteData = selectors.pipettesForInstrumentGroup(state)

  return {
    _values: formValues,
    isFormAltered,
    instruments: {
      left: pipetteData.find(i => i.mount === 'left'),
      right: pipetteData.find(i => i.mount === 'right')
    }
  }
}

function mergeProps (
  stateProps: StateProps,
  dispatchProps: {dispatch: Dispatch<*>}
): Props {
  const {instruments, isFormAltered, _values} = stateProps
  const {dispatch} = dispatchProps

  const onChange = (accessor) => (e: SyntheticInputEvent<*>) => {
    if (accessor === 'name' || accessor === 'description' || accessor === 'author') {
      dispatch(actions.updateFileMetadataFields({[accessor]: e.target.value}))
    } else {
      console.warn('Invalid accessor in ConnectedFilePage:', accessor)
    }
  }

  const formConnector: FormConnector<FileMetadataFields> = formConnectorFactory(onChange, _values)

  return {
    formConnector,
    isFormAltered,
    instruments
  }
}
