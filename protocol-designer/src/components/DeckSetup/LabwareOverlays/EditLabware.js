// @flow
import React, { type Node } from 'react'
import { connect } from 'react-redux'
import cx from 'classnames'
import { Icon } from '@opentrons/components'
import { getLabwareDisplayName, type ModuleType } from '@opentrons/shared-data'
import { DragSource, DropTarget } from 'react-dnd'
import i18n from '../../../localization'
import NameThisLabware from './NameThisLabware'
import { BlockedSlotDiv } from './BlockedSlot'
import { DND_TYPES } from './constants'
import {
  openIngredientSelector,
  deleteContainer,
  duplicateLabware,
  moveDeckItem,
} from '../../../labware-ingred/actions'
import { getLabwareIsCompatible } from '../../../utils/labwareModuleCompatibility'
import { selectors as labwareIngredSelectors } from '../../../labware-ingred/selectors'
import { selectors as stepFormSelectors } from '../../../step-forms'
import type { BaseState, ThunkDispatch, DeckSlot } from '../../../types'
import type { LabwareOnDeck, ModuleOnDeck } from '../../../step-forms'
import styles from './LabwareOverlays.css'

type ModulesById = { [id: string]: ModuleOnDeck }
type OP = {|
  labwareOnDeck: LabwareOnDeck,
|}
type SP = {|
  isYetUnnamed: boolean,
  modulesById: ModulesById,
|}
type DP = {|
  editLiquids: () => mixed,
  duplicateLabware: () => mixed,
  deleteLabware: () => mixed,
  moveDeckItem: (DeckSlot, DeckSlot) => mixed,
|}

type DNDP = {|
  draggedLabware: ?LabwareOnDeck,
  isOver: boolean,
  connectDragSource: Node => Node,
  connectDropTarget: Node => Node,
|}

type Props = {| ...OP, ...SP, ...DP, ...DNDP |}

const getBlocked = (args: {
  labwareOnDeck: LabwareOnDeck,
  draggedLabware: ?LabwareOnDeck,
  modulesById: ModulesById,
}): {| labwareMoveBlocked: boolean, labwareSwapBlocked: boolean |} => {
  const { labwareOnDeck, draggedLabware, modulesById } = args

  const destModuleType: ?ModuleType = modulesById[labwareOnDeck.slot]?.type
  const sourceModuleType: ?ModuleType =
    (draggedLabware && modulesById[(draggedLabware?.slot)]?.type) || null
  const draggedDef = draggedLabware?.def
  const labwareMoveBlocked =
    draggedDef && destModuleType
      ? !getLabwareIsCompatible(draggedDef, destModuleType)
      : false
  const labwareSwapBlocked = sourceModuleType
    ? !getLabwareIsCompatible(labwareOnDeck.def, sourceModuleType)
    : false

  return { labwareMoveBlocked, labwareSwapBlocked }
}

const EditLabware = (props: Props) => {
  const {
    labwareOnDeck,
    isYetUnnamed,
    editLiquids,
    deleteLabware,
    duplicateLabware,
    draggedLabware,
    isOver,
    connectDragSource,
    connectDropTarget,
    modulesById,
  } = props

  const { isTiprack } = labwareOnDeck.def.parameters
  if (isYetUnnamed && !isTiprack) {
    return (
      <NameThisLabware
        labwareOnDeck={labwareOnDeck}
        editLiquids={editLiquids}
      />
    )
  } else {
    const isBeingDragged = draggedLabware?.slot === labwareOnDeck.slot

    let contents: ?Node = null

    const { labwareMoveBlocked, labwareSwapBlocked } = getBlocked({
      labwareOnDeck,
      draggedLabware,
      modulesById,
    })

    if (labwareMoveBlocked || labwareSwapBlocked) {
      contents = (
        <BlockedSlotDiv
          message={
            labwareMoveBlocked
              ? 'MODULE_INCOMPATIBLE_SINGLE_LABWARE'
              : 'MODULE_INCOMPATIBLE_LABWARE_SWAP'
          }
        />
      )
    } else if (draggedLabware) {
      contents = (
        <div
          className={cx(styles.overlay_button, {
            [styles.drag_text]: isBeingDragged,
          })}
        >
          {i18n.t(
            `deck.overlay.slot.${
              isBeingDragged ? 'drag_to_new_slot' : 'place_here'
            }`
          )}
        </div>
      )
    } else {
      contents = (
        <>
          {!isTiprack ? (
            <a className={styles.overlay_button} onClick={editLiquids}>
              <Icon className={styles.overlay_icon} name="pencil" />
              {i18n.t('deck.overlay.edit.name_and_liquids')}
            </a>
          ) : (
            <div className={styles.button_spacer} />
          )}
          <a className={styles.overlay_button} onClick={duplicateLabware}>
            <Icon className={styles.overlay_icon} name="content-copy" />
            {i18n.t('deck.overlay.edit.duplicate')}
          </a>
          <a className={styles.overlay_button} onClick={deleteLabware}>
            <Icon className={styles.overlay_icon} name="close" />
            {i18n.t('deck.overlay.edit.delete')}
          </a>
        </>
      )
    }

    return connectDragSource(
      connectDropTarget(
        <div
          className={cx(styles.slot_overlay, {
            [styles.padded_slot_overlay]: !(
              labwareMoveBlocked || labwareSwapBlocked
            ),
            [styles.appear_on_mouseover]: !isBeingDragged && !isYetUnnamed,
            [styles.appear]: isOver,
            [styles.disabled]: isBeingDragged,
          })}
        >
          {contents}
        </div>
      )
    )
  }
}

const labwareSource = {
  beginDrag: props => ({ labwareOnDeck: props.labwareOnDeck }),
}
const collectLabwareSource = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
  draggedItem: monitor.getItem(),
})
const DragEditLabware = DragSource(
  DND_TYPES.LABWARE,
  labwareSource,
  collectLabwareSource
)(EditLabware)

const labwareTarget = {
  canDrop: (props: { ...OP, ...SP, ...DP }, monitor) => {
    const draggedItem = monitor.getItem()
    const draggedLabware = draggedItem?.labwareOnDeck
    const { labwareOnDeck, modulesById } = props
    const isDifferentSlot =
      draggedLabware && draggedLabware.slot !== props.labwareOnDeck.slot
    const { labwareMoveBlocked, labwareSwapBlocked } = getBlocked({
      labwareOnDeck,
      draggedLabware,
      modulesById,
    })
    return isDifferentSlot && !labwareMoveBlocked && !labwareSwapBlocked
  },
  drop: (props, monitor) => {
    const draggedItem = monitor.getItem()
    if (draggedItem) {
      props.moveDeckItem(
        draggedItem.labwareOnDeck.slot,
        props.labwareOnDeck.slot
      )
    }
  },
}
const collectLabwareTarget = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  draggedLabware: monitor.getItem()?.labwareOnDeck || null,
})
export const DragDropEditLabware = DropTarget(
  DND_TYPES.LABWARE,
  labwareTarget,
  collectLabwareTarget
)(DragEditLabware)

const mapStateToProps = (state: BaseState, ownProps: OP): SP => {
  const { id } = ownProps.labwareOnDeck
  const hasName = labwareIngredSelectors.getSavedLabware(state)[id]
  return {
    isYetUnnamed: !ownProps.labwareOnDeck.def.parameters.isTiprack && !hasName,
    modulesById: stepFormSelectors.getInitialDeckSetup(state).modules,
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<*>, ownProps: OP): DP => ({
  editLiquids: () =>
    dispatch(openIngredientSelector(ownProps.labwareOnDeck.id)),
  duplicateLabware: () => dispatch(duplicateLabware(ownProps.labwareOnDeck.id)),
  deleteLabware: () => {
    window.confirm(
      `Are you sure you want to permanently delete this ${getLabwareDisplayName(
        ownProps.labwareOnDeck.def
      )}?`
    ) && dispatch(deleteContainer({ labwareId: ownProps.labwareOnDeck.id }))
  },
  moveDeckItem: (sourceSlot, destSlot) =>
    dispatch(moveDeckItem(sourceSlot, destSlot)),
})

export default connect<
  {| ...OP, ...SP, ...DP |},
  OP,
  SP,
  DP,
  BaseState,
  ThunkDispatch<*>
>(
  mapStateToProps,
  mapDispatchToProps
)(DragDropEditLabware)
