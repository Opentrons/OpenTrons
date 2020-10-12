import * as React from 'react'

import { getPipetteModelSpecs } from '@opentrons/shared-data'
import {
  ModalPage,
  SpinnerModalPage,
  useConditionalConfirm,
  DISPLAY_FLEX,
  DIRECTION_COLUMN,
  ALIGN_CENTER,
  JUSTIFY_CENTER,
  SPACING_3,
  C_TRANSPARENT,
  ALIGN_FLEX_START,
  C_WHITE,
} from '@opentrons/components'

import * as Sessions from '../../sessions'
import {
  Introduction,
  DeckSetup,
  TipPickUp,
  TipConfirmation,
  SaveZPoint,
  SaveXYPoint,
  CompleteConfirmation,
  ConfirmExitModal,
} from '../CalibrationPanels'

import type { StyleProps } from '@opentrons/components'
import type {
  DeckCalibrationLabware,
  SessionCommandParams,
} from '../../sessions/types'
import type { CalibratePipetteOffsetParentProps } from './types'
import type { CalibrationPanelProps } from '../CalibrationPanels/types'


const ROBOT_CALIBRATION_CHECK_SUBTITLE = 'Robot calibration check'
const EXIT = 'exit'

const PANEL_BY_STEP: {
  [string]: React.ComponentType<CalibrationPanelProps>,
} = {
  [Sessions.CHECK_STEP_SESSION_STARTED]: Introduction,
  [Sessions.CHECK_STEP_LABWARE_LOADED]: DeckSetup,
  [Sessions.CHECK_STEP_PREPARING_PIPETTE]: TipPickUp,
  [Sessions.CHECK_STEP_COMPARING_HEIGHT]: TipConfirmation,
  [Sessions.CHECK_STEP_COMPARING_POINT_ONE]: SaveZPoint,
  [Sessions.CHECK_STEP_COMPARING_POINT_TWO]: SaveXYPoint,
  [Sessions.CHECK_STEP_COMPARING_POINT_THREE]: CompleteConfirmation,
  [Sessions.CHECK_STEP_CHECK_COMPLETE]: CompleteConfirmation,
}

const PANEL_STYLE_PROPS_BY_STEP: {
  [string]: StyleProps,
} = {
  [Sessions.CHECK_STEP_SESSION_STARTED]: terminalContentsStyleProps,
  [Sessions.CHECK_STEP_LABWARE_LOADED]: darkContentsStyleProps,
  [Sessions.CHECK_STEP_PREPARING_PIPETTE]: contentsStyleProps,
  [Sessions.CHECK_STEP_COMPARING_HEIGHT]: contentsStyleProps,
  [Sessions.CHECK_STEP_COMPARING_POINT_ONE]: contentsStyleProps,
  [Sessions.CHECK_STEP_COMPARING_POINT_TWO]: contentsStyleProps,
  [Sessions.CHECK_STEP_COMPARING_POINT_THREE]: terminalContentsStyleProps,
  [Sessions.CHECK_STEP_CHECK_COMPLETE]: terminalContentsStyleProps,
}

export function CheckCalibration(
  props: CheckCalibrationParentProps
): React.Node {
  const {
    session,
    robotName,
    closeWizard,
    dispatchRequests,
    showSpinner,
  } = props
  const { currentStep, instrument, labware } = session?.details || {}

  const {
    showConfirmation: showConfirmExit,
    confirm: confirmExit,
    cancel: cancelExit,
  } = useConditionalConfirm(() => {
    cleanUpAndExit()
  }, true)

  const isMulti = React.useMemo(() => {
    const spec = instrument && getPipetteModelSpecs(instrument.model)
    return spec ? spec.channels > 1 : false
  }, [instrument])

  function sendCommands(...commands: Array<SessionCommandParams>) {
    if (session?.id) {
      const sessionCommandActions = commands.map(c =>
        Sessions.createSessionCommand(robotName, session.id, {
          command: c.command,
          data: c.data || {},
        })
      )
      dispatchRequests(...sessionCommandActions)
    }
  }

  function cleanUpAndExit() {
    if (session?.id) {
      dispatchRequests(
        Sessions.createSessionCommand(robotName, session.id, {
          command: Sessions.sharedCalCommands.EXIT,
          data: {},
        }),
        Sessions.deleteSession(robotName, session.id)
      )
    }
    closeWizard()
  }

  const tipRack: DeckCalibrationLabware | null =
    (labware && labware.find(l => l.isTiprack)) ?? null

  if (!session || !tipRack) {
    return null
  }

  const titleBarProps = {
    title: ROBOT_CALIBRATION_CHECK_SUBTITLE,
    back: { onClick: confirmExit, title: EXIT, children: EXIT },
  }

  if (showSpinner) {
    return <SpinnerModalPage titleBar={titleBarProps} />
  }

  const Panel = PANEL_BY_STEP[currentStep]
  return Panel ? (
    <>
      <ModalPage
        titleBar={titleBarProps}
        innerProps={PANEL_STYLE_PROPS_BY_STEP[currentStep]}
      >
        <Panel
          sendCommands={sendCommands}
          cleanUpAndExit={cleanUpAndExit}
          tipRack={tipRack}
          isMulti={isMulti}
          mount={instrument?.mount.toLowerCase()}
          currentStep={currentStep}
          sessionType={session.sessionType}
        />
      </ModalPage>
      {showConfirmExit && (
        <ConfirmExitModal
          exit={confirmExit}
          back={cancelExit}
          sessionType={session.sessionType}
        />
      )}
    </>
  ) : null
}
