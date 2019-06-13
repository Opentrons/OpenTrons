// @flow
// app info card with version and updated
import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import reduce from 'lodash/reduce'

import {
  fetchSettings,
  setSettings,
  getRobotSettingsState,
} from '../../robot-api'

import { getConfig } from '../../config'
import { CONNECTABLE } from '../../discovery'
import { downloadLogs } from '../../shell'
import { RefreshCard } from '@opentrons/components'
import { LabeledButton, LabeledToggle } from '../controls'
import PipetteUpdateWarningModal from './PipetteUpdateWarningModal'

import type { State, Dispatch } from '../../types'
import type { ViewableRobot } from '../../discovery'
import type { RobotSettings } from '../../robot-api'
import type { ToggleRef } from './PipetteUpdateWarningModal'
import UploadRobotUpdate from './UploadRobotUpdate'

type OP = {|
  robot: ViewableRobot,
  resetUrl: string,
|}

type SP = {|
  settings: RobotSettings,
  showPipetteUpdateWarning: boolean,
  __buildRootEnabled: boolean,
|}

type DP = {|
  fetch: () => mixed,
  set: (id: string, value: boolean) => mixed,
  download: () => mixed,
|}

type Props = { ...OP, ...SP, ...DP }

type BooleanSettingProps = {
  id: string,
  title: string,
  description: string,
  value: boolean | null,
  set: (id: string, value: boolean) => mixed,
  toggleRef?: ToggleRef,
}

const TITLE = 'Advanced Settings'
const PIPETTE_UPDATE_OPT_OUT_ID = 'useOldAspirationFunctions'

class BooleanSettingToggle extends React.Component<BooleanSettingProps> {
  toggle = value => this.props.set(this.props.id, !this.props.value)

  render() {
    return (
      <LabeledToggle
        label={this.props.title}
        onClick={this.toggle}
        toggledOn={this.props.value === true}
      >
        <p ref={this.props.toggleRef}>{this.props.description}</p>
      </LabeledToggle>
    )
  }
}

class AdvancedSettingsCard extends React.Component<Props> {
  pipetteUpdateOptOutRef: ToggleRef

  constructor(props: Props) {
    super(props)
    this.pipetteUpdateOptOutRef = React.createRef()
  }

  render() {
    const {
      robot,
      settings,
      set,
      fetch,
      download,
      resetUrl,
      showPipetteUpdateWarning,
    } = this.props
    const { name, health, status } = robot
    const disabled = status !== CONNECTABLE
    const logsAvailable = health && health.logs

    return (
      <RefreshCard
        watch={name}
        refresh={fetch}
        title={TITLE}
        disabled={disabled}
        column
      >
        <LabeledButton
          label="Download Logs"
          buttonProps={{
            disabled: disabled || !logsAvailable,
            onClick: download,
            children: 'Download',
          }}
        >
          <p>Access logs from this robot.</p>
        </LabeledButton>
        <LabeledButton
          label="Factory Reset"
          buttonProps={{
            disabled,
            Component: Link,
            to: resetUrl,
            children: 'Reset',
          }}
        >
          <p>Restore robot to factory configuration</p>
        </LabeledButton>
        {showPipetteUpdateWarning && (
          <PipetteUpdateWarningModal
            id={PIPETTE_UPDATE_OPT_OUT_ID}
            set={set}
            toggleRef={this.pipetteUpdateOptOutRef}
          />
        )}
        {settings.map(s => (
          <BooleanSettingToggle
            {...s}
            key={s.id}
            set={set}
            toggleRef={
              s.id === PIPETTE_UPDATE_OPT_OUT_ID
                ? this.pipetteUpdateOptOutRef
                : undefined
            }
          />
        ))}
        {this.props.__buildRootEnabled && <UploadRobotUpdate />}
      </RefreshCard>
    )
  }
}

function mapStateToProps(state: State, ownProps: OP): SP {
  const { robot } = ownProps
  const settings = getRobotSettingsState(state, robot.name)
  const pipetteUpdateOptedOut = reduce(
    settings,
    (result, setting) => {
      if (setting.id === PIPETTE_UPDATE_OPT_OUT_ID) return setting.value
      return result
    },
    false
  )

  return {
    settings: settings,
    showPipetteUpdateWarning: pipetteUpdateOptedOut === null,
    __buildRootEnabled: Boolean(getConfig(state).devInternal?.enableBuildRoot),
  }
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OP): DP {
  const { robot } = ownProps

  return {
    fetch: () => dispatch(fetchSettings(robot)),
    set: (id, value) => dispatch(setSettings(robot, { id, value })),
    download: () => dispatch(downloadLogs(robot)),
  }
}

export default connect<Props, OP, SP, DP, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(AdvancedSettingsCard)
