// @flow
import React, { useMemo } from 'react'
import cx from 'classnames'

import { getModuleDisplayName, type ModuleType } from '@opentrons/shared-data'
import { getDeckDefinitions } from '@opentrons/components/src/deck/getDeckDefinitions'

import { Icon } from '../icons'
import RobotCoordsForeignDiv from './RobotCoordsForeignDiv'
import styles from './Module.css'

export type Props = {
  /** name of module, eg 'magdeck' or 'tempdeck' */
  name: ModuleType,
  /** display mode: 'default', 'present', 'missing', or 'info' */
  mode: 'default' | 'present' | 'missing' | 'info',
}

export default function Module(props: Props) {
  // TODO: BC 2019-7-23 get these from shared data, once absolute
  // dimensions are added to data
  const deckDef = useMemo(() => getDeckDefinitions()['ot2_standard'], [])
  let x = 0
  let y = 0
  let {
    xDimension: width,
    yDimension: height,
  } = deckDef?.locations?.orderedSlots[0]?.boundingBox

  switch (props.name) {
    case 'magdeck': {
      width = 137
      height = 91
      x = -7
      y = 4
      break
    }
    case 'tempdeck': {
      width = 196
      height = 91
      x = -66
      y = 4
      break
    }
    case 'thermocycler':
    case 'semithermocycler': {
      width = 170
      height = 258
      x = props.name === 'thermocycler' ? -25 : -45
    }
  }

  return (
    <RobotCoordsForeignDiv
      width={width}
      height={height}
      x={x}
      y={y - height}
      transformWithSVG
      innerDivProps={{ className: styles.module }}
    >
      <ModuleItemContents {...props} />
    </RobotCoordsForeignDiv>
  )
}

function ModuleItemContents(props: Props) {
  // TODO(mc, 2018-07-23): displayName?
  const { mode, name } = props
  const displayName = getModuleDisplayName(name)

  const message =
    mode === 'missing' ? (
      <>
        <p className={styles.module_review_text}>Missing:</p>
        {displayName.split(' ').map((chunk, i) => (
          <p key={i} className={styles.module_review_text}>
            {chunk}
          </p>
        ))}
      </>
    ) : (
      <>
        {displayName.split(' ').map((chunk, i) => (
          <p key={i} className={styles.module_review_text}>
            {chunk}
          </p>
        ))}
      </>
    )

  const iconClassName = cx(styles.module_review_icon, {
    [styles.module_review_icon_missing]: mode === 'missing',
    [styles.module_review_icon_present]: mode === 'present',
  })

  const iconNameByMode = {
    missing: 'alert-circle',
    present: 'check-circle',
    info: 'usb',
    default: 'usb',
  }

  return (
    <React.Fragment>
      <Icon
        className={iconClassName}
        x="8"
        y="0"
        width="16"
        name={iconNameByMode[mode] || 'usb'}
      />
      <div className={styles.module_text_wrapper}>{message}</div>
    </React.Fragment>
  )
}
