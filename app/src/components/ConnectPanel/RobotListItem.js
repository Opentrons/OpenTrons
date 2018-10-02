// @flow
// list of robots
import * as React from 'react'
import { NotificationIcon, Icon } from '@opentrons/components'

import type { Robot } from '../../robot'
import { ToggleButton } from '../controls'
import RobotLink from './RobotLink'
import styles from './connect-panel.css'

type ItemProps = Robot & {
  upgradable: ?string,
  selected: boolean,
  connect: () => mixed,
  disconnect: () => mixed,
}

export function RobotListItem (props: ItemProps) {
  const {
    name,
    wired,
    selected,
    isConnected,
    upgradable,
    connect,
    disconnect,
  } = props
  const onClick = isConnected ? disconnect : connect

  return (
    <li className={styles.robot_group}>
      <RobotLink url={`/robots/${name}`} className={styles.robot_item} exact>
        <NotificationIcon
          name={wired ? 'usb' : 'wifi'}
          className={styles.robot_item_icon}
          childName={upgradable ? 'circle' : null}
          childClassName={styles.notification}
        />

        <p className={styles.link_text}>{name}</p>

        <ToggleButton
          toggledOn={isConnected}
          onClick={onClick}
          className={styles.robot_item_icon}
        />
      </RobotLink>
      {selected && (
        <RobotLink
          url={`/robots/${name}/instruments`}
          className={styles.instrument_item}
        >
          <p className={styles.link_text}>Pipettes & Modules</p>
          <Icon name="chevron-right" className={styles.robot_item_icon} />
        </RobotLink>
      )}
    </li>
  )
}
