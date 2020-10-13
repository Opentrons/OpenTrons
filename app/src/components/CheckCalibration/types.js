// @flow
import type { Action } from '../../types'
import type {
  SessionCommandParams,
  PipetteOffsetCalibrationSession,
  CalibrationLabware,
} from '../../sessions/types'

import type { PipetteOffsetCalibrationStep } from '../../sessions/pipette-offset-calibration/types'

export type CalibrationHealthCheckParentProps = {|
    robotName: string,
    session: PipetteOffsetCalibrationSession | null,
    closeWizard: () => void,
    dispatchRequests: (
      ...Array<{ ...Action, meta: { requestId: string } }>
    ) => void,
    showSpinner: boolean,
    hasBlock?: boolean,
  |}