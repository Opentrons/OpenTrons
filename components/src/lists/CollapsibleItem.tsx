// CollapsibleItem component
import * as React from 'react'
import cx from 'classnames'

import styles from './lists.css'
import { Icon } from '../icons'

export interface CollapsibleItemProps {
  /** header */
  header?: string
  /** text of title */
  title: string
  /** children nodes */
  children?: React.ReactNode
  /** additional classnames */
  className?: string
  /** caret click action; if defined, list is expandable and carat is visible */
  onCollapseToggle: (event: React.MouseEvent) => unknown
  /** collapse the list if true (false by default) */
  collapsed: boolean
}

/**
 * A list item with title, and collapsible children.
 */
export function CollapsibleItem(props: CollapsibleItemProps): JSX.Element {
  const { onCollapseToggle, header } = props
  const collapsible = onCollapseToggle != null
  const hasHeader = header != null

  // clicking on the carat will not call props.onClick,
  // so prevent bubbling up if there is an onCollapseToggle fn
  const handleCollapseToggle = (e: React.MouseEvent): void => {
    e.stopPropagation()
    onCollapseToggle(e)
  }

  const hasValidChildren = React.Children.toArray(props.children).some(
    child => child
  )

  const className = cx(styles.titled_list, props.className, {
    [styles.titled_list_selected]: !props.collapsed,
  })

  const titleBarClass = cx(styles.title_bar, styles.clickable)

  return (
    <div className={className}>
      <div className={titleBarClass}>
        {hasHeader && <p className={styles.header_text}>{header}</p>}
        <h3 className={styles.title}>{props.title}</h3>
        {collapsible && (
          <div
            onClick={handleCollapseToggle}
            className={styles.title_bar_carat}
          >
            <Icon
              className={styles.title_bar_icon}
              name={props.collapsed ? 'chevron-down' : 'chevron-up'}
            />
          </div>
        )}
      </div>
      {!props.collapsed && hasValidChildren && (
        <ol className={styles.list}>{props.children}</ol>
      )}
    </div>
  )
}
