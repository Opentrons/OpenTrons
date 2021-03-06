import * as React from 'react'
import last from 'lodash/last'
import { useSelector, useDispatch } from 'react-redux'
import {
  Flex,
  SecondaryBtn,
  useHoverTooltip,
  Tooltip,
  Icon,
  AlertModal,
  JUSTIFY_FLEX_END,
  DISPLAY_INLINE_BLOCK,
} from '@opentrons/components'
import { Portal } from '../../../../App/portal'
import { getConnectedRobotName } from '../../../../redux/robot/selectors'
import {
  useDispatchApiRequest,
  getRequestById,
  getErrorResponseMessage,
  PENDING,
  FAILURE,
  dismissRequest,
} from '../../../../redux/robot-api'
import { updateModule } from '../../../../redux/modules'
import type { State, Dispatch } from '../../../../redux/types'
import type { RequestState } from '../../../../redux/robot-api/types'

const FW_IS_UP_TO_DATE = 'Module Firmware is up to date'
const OK_TEXT = 'Ok'

const UPDATE = 'update'
const UPDATE_TO_DATE = 'up to date'

const FAILED_UPDATE_HEADER = 'Failed to update Module Firmware'
const FAILED_UPDATE_BODY =
  'An error occurred while attempting to update your robot.'

interface Props {
  hasAvailableUpdate: boolean
  controlDisabledReason: string | null
  moduleId: string
}

export function ModuleUpdate(props: Props): JSX.Element {
  const { hasAvailableUpdate, moduleId, controlDisabledReason } = props
  const dispatch = useDispatch<Dispatch>()
  const robotName = useSelector(getConnectedRobotName)
  const [dispatchApiRequest, requestIds] = useDispatchApiRequest()

  const canControl = controlDisabledReason === null
  const handleClick = (): void => {
    canControl &&
      robotName &&
      dispatchApiRequest(updateModule(robotName, moduleId))
  }
  const latestRequestId = last(requestIds)
  const latestRequest = useSelector<State, RequestState | null>(state =>
    // @ts-expect-error TODO: should be `latestRequestId ? getRequestById(state, latestRequestId) : null` to be
    // extra cautious that we don't pass a non-existent latestRequestId to anything that is expecting a real id.
    getRequestById(state, latestRequestId)
  )
  const isPending = latestRequest?.status === PENDING

  const buttonText = hasAvailableUpdate ? UPDATE : UPDATE_TO_DATE
  let tooltipText = null
  if (!hasAvailableUpdate) {
    tooltipText = FW_IS_UP_TO_DATE
  } else if (controlDisabledReason !== null) {
    tooltipText = controlDisabledReason
  }
  const [targetProps, tooltipProps] = useHoverTooltip()

  const handleCloseErrorModal = (): void => {
    // @ts-expect-error TODO: use code below
    dispatch(dismissRequest(latestRequestId))
    // if (latestRequestId != null) {
    //   dispatch(dismissRequest(latestRequestId))
    // }
  }
  return (
    <Flex justifyContent={JUSTIFY_FLEX_END} display={DISPLAY_INLINE_BLOCK}>
      <SecondaryBtn
        width="11rem"
        onClick={handleClick}
        disabled={!canControl || !hasAvailableUpdate || isPending}
        {...targetProps}
      >
        {isPending ? <Icon name="ot-spinner" height="1em" spin /> : buttonText}
      </SecondaryBtn>
      <Tooltip {...tooltipProps}>{tooltipText}</Tooltip>
      {latestRequest && latestRequest.status === FAILURE && (
        <Portal>
          <AlertModal
            alertOverlay
            heading={FAILED_UPDATE_HEADER}
            buttons={[{ children: OK_TEXT, onClick: handleCloseErrorModal }]}
          >
            <p>{FAILED_UPDATE_BODY}</p>
            <p>{getErrorResponseMessage(latestRequest.error)}</p>
            {/* TODO: use the following instead: */}
            {/* <p>
              {latestRequest.error != null
                ? getErrorResponseMessage(latestRequest.error)
                : null}
            </p> */}
          </AlertModal>
        </Portal>
      )}
    </Flex>
  )
}
