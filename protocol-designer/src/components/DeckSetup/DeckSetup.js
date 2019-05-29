// @flow
import React, { useMemo } from 'react'
import map from 'lodash/map'
import filter from 'lodash/filter'
import some from 'lodash/some'
import {
  LabwareRender,
  useOnClickOutside,
  RobotWorkSpace,
  RobotCoordsForeignDiv,
} from '@opentrons/components'
import { getDeckDefinitions } from '@opentrons/components/src/deck/getDeckDefinitions'
import i18n from '../../localization'
import BrowseLabwareModal from '../labware/BrowseLabwareModal'
import { START_TERMINAL_ITEM_ID, type TerminalItemId } from '../../steplist'
import type { InitialDeckSetup, LabwareOnDeck } from '../../step-forms'

import { SlotControls, LabwareControls, DragPreview } from './LabwareOverlays'
import styles from './DeckSetup.css'

type Props = {|
  selectedTerminalItemId: ?TerminalItemId,
  handleClickOutside?: () => mixed,
  drilledDown: boolean,
  initialDeckSetup: InitialDeckSetup,
  ingredSelectionMode: boolean, // TODO: BC 2019-05-22 is this needed anymore?
|}

const DeckSetup = (props: Props) => {
  const deckDef = useMemo(() => getDeckDefinitions()['ot2_standard'], [])
  const wrapperRef = useOnClickOutside({
    onClickOutside: props.handleClickOutside,
  })
  const headerMessage = props.selectedTerminalItemId
    ? i18n.t(
        `deck.header.${
          props.selectedTerminalItemId === START_TERMINAL_ITEM_ID
            ? 'start'
            : 'end'
        }`
      )
    : null
  return (
    <React.Fragment>
      <div className={styles.deck_row}>
        {props.drilledDown && <BrowseLabwareModal />}
        <div ref={wrapperRef} className={styles.deck_wrapper}>
          <RobotWorkSpace
            deckLayerBlacklist={[
              // 'slotRidges',
              // 'slotNumbers',
              // 'fixedTrash',
              'calibrationMarkings',
              'fixedBase',
              'removableDeckOutline',
              'doorStops',
              'metalFrame',
              'removalHandle',
              'screwHoles',
            ]}
            deckDef={deckDef}
            viewBox={`-10 -10 ${410} ${390}`} // viewbox for small
            // viewBox={`-10 -10 ${460} ${452}`} // viewbox for mid
          >
            {({ slots, getRobotCoordsFromDOM }) => (
              <>
                <DragPreview getRobotCoordsFromDOM={getRobotCoordsFromDOM} />
                <RobotCoordsForeignDiv
                  x={0}
                  y={364}
                  height={30}
                  width={380}
                  innerDivProps={{
                    className: styles.deck_instructions,
                  }}
                >
                  {headerMessage}
                </RobotCoordsForeignDiv>

                {map(slots, (slot, slotId) => {
                  if (!slot.matingSurfaceUnitVector) return null // if slot has no mating surface, don't render labware or overlays

                  const containedLabware: Array<LabwareOnDeck> = filter(
                    props.initialDeckSetup.labware,
                    labware =>
                      labware.slot === slotId &&
                      !(
                        labware.def.parameters.quirks &&
                        labware.def.parameters.quirks.includes('fixedTrash')
                      )
                  )

                  if (some(containedLabware)) {
                    // NOTE: only controlling first contained labware for now!
                    return (
                      <>
                        {map(containedLabware, labwareOnDeck => (
                          <g
                            key={labwareOnDeck.id}
                            transform={`translate(${
                              slots[labwareOnDeck.slot].position[0]
                            }, ${slots[labwareOnDeck.slot].position[1]})`}
                          >
                            <LabwareRender definition={labwareOnDeck.def} />
                          </g>
                        ))}
                        <g>
                          <LabwareControls
                            slot={slot}
                            labwareOnDeck={containedLabware[0]}
                            selectedTerminalItemId={
                              props.selectedTerminalItemId
                            }
                          />
                        </g>
                      </>
                    )
                  }

                  return (
                    <SlotControls
                      key={slot.id}
                      slot={slot}
                      selectedTerminalItemId={props.selectedTerminalItemId}
                    />
                  )
                })}
              </>
            )}
          </RobotWorkSpace>
        </div>
      </div>
    </React.Fragment>
  )
}

export default DeckSetup
