// @flow
import * as React from 'react'
import styles from './layout.css'

type Props = {
  children: React.Node,
}
export default function CardRow(props: Props) {
  return <div className={styles.row}>{props.children}</div>
}
