import * as React from 'react'
import { getModuleVizDims } from './getModuleVizDims'
import styles from './ModuleViz.css'
import { ModuleOnDeck } from '../../step-forms'
import { ModuleOrientation } from '../../types'

interface Props {
  x: number
  y: number
  orientation: ModuleOrientation
  module: ModuleOnDeck
  slotName: string
}

export const ModuleViz = (props: Props): JSX.Element => {
  const moduleType = props.module.type
  const {
    xOffset,
    yOffset,
    xDimension,
    yDimension,
    childXOffset,
    childYOffset,
    childXDimension,
    childYDimension,
  } = getModuleVizDims(props.orientation, moduleType)

  return (
    <g data-test={`ModuleViz_${moduleType}`}>
      <rect
        x={props.x + xOffset}
        y={props.y + yOffset}
        height={yDimension}
        width={xDimension}
        className={styles.module_viz}
      />
      <rect
        x={props.x + childXOffset}
        y={props.y + childYOffset}
        height={childYDimension}
        width={childXDimension}
        className={styles.module_slot_area}
      />
    </g>
  )
}
