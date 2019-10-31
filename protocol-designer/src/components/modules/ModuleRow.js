// @flow
import * as React from 'react'
import i18n from '../../localization'
import { useSelector } from 'react-redux'
import { selectors as featureFlagSelectors } from '../../feature-flags'
import { LabeledValue, OutlineButton } from '@opentrons/components'
import ModuleDiagram from './ModuleDiagram'
import styles from './styles.css'

import type { ModuleType } from '@opentrons/shared-data'
import type { MaybeModuleOnDeck } from '../../step-forms'

type Props = {
  ...MaybeModuleOnDeck,
  openEditModuleModal: (moduleType: ModuleType, id?: string) => mixed,
}

export default function ModuleRow(props: Props) {
  const { type, id, slot, model, openEditModuleModal } = props
  const setCurrentModule = (type: ModuleType, id?: string) => () =>
    openEditModuleModal(type, id)
  const addRemoveText = id ? 'remove' : 'add'
  const handleAddOrRemove = id
    ? () => console.log('remove ' + id)
    : setCurrentModule(type)

  const enableEditModules = useSelector(
    featureFlagSelectors.getDisableModuleRestrictions
  )
  const handleEditModule = setCurrentModule(type, id)

  return (
    <div>
      <h4 className={styles.row_title}>
        {i18n.t(`modules.module_display_names.${type}`)}
      </h4>
      <div className={styles.module_row}>
        <div className={styles.module_diagram_container}>
          <ModuleDiagram type={type} />
        </div>
        <div className={styles.module_col}>
          {model && <LabeledValue label="Model" value={model} />}
        </div>
        <div className={styles.module_col}>
          {slot && <LabeledValue label="Slot" value={`Slot ${slot}`} />}
        </div>
        <div className={styles.modules_button_group}>
          {id && (
            <OutlineButton
              className={styles.module_button}
              onClick={handleEditModule}
              disabled={!enableEditModules}
            >
              Edit
            </OutlineButton>
          )}
          <OutlineButton
            className={styles.module_button}
            onClick={handleAddOrRemove}
          >
            {addRemoveText}
          </OutlineButton>
        </div>
      </div>
    </div>
  )
}
