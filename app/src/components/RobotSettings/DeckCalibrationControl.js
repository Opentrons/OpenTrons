// @flow
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { push } from 'connected-react-router'
import last from 'lodash/last'
import {
  useInterval,
  Card,
  Text,
  LabeledToggle,
  LabeledButton,
  SecondaryBtn,
  BORDER_SOLID_LIGHT,
  SPACING_2,
} from '@opentrons/components'

import { startDeckCalibration } from '../../http-api-client'

import {
  home,
  fetchLights,
  updateLights,
  getLightsOn,
  ROBOT,
} from '../../robot-controls'
import { getFeatureFlags } from '../../config'
import * as RobotApi from '../../robot-api'
import * as Sessions from '../../sessions'
import * as Calibration from '../../calibration'
import { restartRobot } from '../../robot-admin'
import { selectors as robotSelectors } from '../../robot'
import { CONNECTABLE } from '../../discovery'

import type { State, Dispatch } from '../../types'
import type { ViewableRobot } from '../../discovery/types'
import type { DeckCalibrationStatus } from '../../calibration/types'

import { Portal } from '../portal'
import { TitledControl } from '../TitledControl'
import { CalibrateDeck } from '../CalibrateDeck'
import { DeckCalibrationWarning } from './DeckCalibrationWarning'

type Props = {|
  robotName: string,
  buttonDisabled: boolean,
  deckCalStatus: DeckCalibrationStatus | null,
  startLegacyDeckCalibration: () => void,
|}

const CALIBRATE_DECK_DESCRIPTION =
  "Calibrate the position of the robot's deck. Recommended for all new robots and after moving robots."
const CALIBRATE_BUTTON_TEXT = 'Calibrate'
const CALIBRATE_TITLE_TEXT = 'Calibrate deck'

export function DeckCalibrationControl(props: Props): React.Node {
  const {
    robotName,
    buttonDisabled,
    deckCalStatus,
    startLegacyDeckCalibration,
  } = props

  const [showWizard, setShowWizard] = React.useState(false)
  const startDeckCalibration = () => {
    // TODO: IMMEDIATELY launch new deck cal wizard
  }

  const [dispatchRequest, requestIds] = RobotApi.useDispatchApiRequest()
  const requestState = useSelector((state: State) => {
    const reqId = last(requestIds) ?? null
    return RobotApi.getRequestById(state, reqId)
  })
  const requestStatus = requestState?.status ?? null

  const ff = useSelector(getFeatureFlags)

  React.useEffect(() => {
    if (requestStatus === RobotApi.SUCCESS) setShowWizard(true)
  }, [requestStatus])

  const handleStartDeckCalSession = () => {
    dispatchRequest(
      Sessions.ensureSession(robotName, Sessions.SESSION_TYPE_DECK_CALIBRATION)
    )
  }

  const deckCalibrationSession = useSelector((state: State) => {
    const session: Sessions.Session | null = Sessions.getRobotSessionOfType(
      state,
      robotName,
      Sessions.SESSION_TYPE_DECK_CALIBRATION
    )
    if (
      session &&
      session.sessionType === Sessions.SESSION_TYPE_DECK_CALIBRATION
    ) {
      return session
    }
    return null
  })

  const handleButtonClick = ff.enableCalibrationOverhaul
    ? handleStartDeckCalSession
    : startLegacyDeckCalibration

  return (
    <>
      <TitledControl
        borderBottom={BORDER_SOLID_LIGHT}
        title={CALIBRATE_TITLE_TEXT}
        description={<Text>{CALIBRATE_DECK_DESCRIPTION}</Text>}
        control={
          <SecondaryBtn
            width="9rem"
            onClick={handleButtonClick}
            disabled={buttonDisabled}
          >
            {CALIBRATE_BUTTON_TEXT}
          </SecondaryBtn>
        }
      >
        <DeckCalibrationWarning
          deckCalibrationStatus={deckCalStatus}
          marginTop={SPACING_2}
        />
      </TitledControl>
      {showWizard && (
        <Portal>
          <CalibrateDeck
            session={deckCalibrationSession}
            robotName={robotName}
            closeWizard={() => setShowWizard(false)}
          />
        </Portal>
      )}
    </>
  )
}
