import fse from 'fs-extra'
import { app, shell } from 'electron'
import { getFullConfig, handleConfigChange } from '../config'
import { showOpenDirectoryDialog, showOpenFileDialog } from '../dialogs'
import { createLogger } from '../log'
import { getMainWindow } from '../main-window'
import * as Definitions from './definitions'
import { validateLabwareFiles, validateNewLabwareFile } from './validation'
import { sameIdentity } from './compare'

import { UI_INITIALIZED } from '@opentrons/app/src/redux/shell/actions'
import * as CustomLabware from '@opentrons/app/src/redux/custom-labware'
import * as ConfigActions from '@opentrons/app/src/redux/config'

import type {
  UncheckedLabwareFile,
  DuplicateLabwareFile,
  CustomLabwareListActionSource as ListSource,
} from '@opentrons/app/src/redux/custom-labware/types'

import type { Action, Dispatch } from '../types'

const ensureDir: (dir: string) => Promise<void> = fse.ensureDir

const log = createLogger('labware')

const fetchCustomLabware = (): Promise<UncheckedLabwareFile[]> => {
  const { labware: config } = getFullConfig()

  return ensureDir(config.directory)
    .then(() => Definitions.readLabwareDirectory(config.directory))
    .then(Definitions.parseLabwareFiles)
}

const fetchAndValidateCustomLabware = (
  dispatch: Dispatch,
  source: ListSource
): Promise<void> => {
  return fetchCustomLabware()
    .then(files => {
      const payload = validateLabwareFiles(files)
      dispatch(CustomLabware.customLabwareList(payload, source))
    })
    .catch((error: Error) => {
      dispatch(CustomLabware.customLabwareListFailure(error.message, source))
    })
}

const overwriteLabware = (
  dispatch: Dispatch,
  next: DuplicateLabwareFile
): Promise<void> => {
  return fetchCustomLabware()
    .then(files => {
      const existing = validateLabwareFiles(files)
      const duplicates = existing.filter(e => sameIdentity(next, e))
      const removals = duplicates.map(d =>
        Definitions.removeLabwareFile(d.filename)
      )

      return Promise.all(removals)
    })
    .then(() => {
      const dir = getFullConfig().labware.directory
      return Definitions.addLabwareFile(next.filename, dir)
    })
    .then(() =>
      fetchAndValidateCustomLabware(dispatch, CustomLabware.OVERWRITE_LABWARE)
    )
}

const copyLabware = (
  dispatch: Dispatch,
  filePaths: string[]
): Promise<void> => {
  return Promise.all([
    fetchCustomLabware(),
    Definitions.parseLabwareFiles(filePaths),
  ]).then(([existingFiles, [newFile]]) => {
    const existing = validateLabwareFiles(existingFiles)
    const next = validateNewLabwareFile(existing, newFile)
    const dir = getFullConfig().labware.directory

    if (next.type !== CustomLabware.VALID_LABWARE_FILE) {
      return dispatch(CustomLabware.addCustomLabwareFailure(next))
    }

    return Definitions.addLabwareFile(next.filename, dir).then(() =>
      fetchAndValidateCustomLabware(dispatch, CustomLabware.ADD_LABWARE)
    )
  })
}

export function registerLabware(dispatch: Dispatch): Dispatch {
  handleConfigChange(CustomLabware.LABWARE_DIRECTORY_CONFIG_PATH, () => {
    fetchAndValidateCustomLabware(
      dispatch,
      CustomLabware.CHANGE_DIRECTORY
    ).catch(error =>
      log.error(
        'Unexpected error initializing custom labware after directory change',
        { error }
      )
    )
  })

  return function handleActionForLabware(action: Action) {
    switch (action.type) {
      case CustomLabware.FETCH_CUSTOM_LABWARE:
      case UI_INITIALIZED: {
        const source =
          action.type === CustomLabware.FETCH_CUSTOM_LABWARE
            ? CustomLabware.POLL
            : CustomLabware.INITIAL
        fetchAndValidateCustomLabware(dispatch, source).catch(error =>
          log.error('Unexpected error initializing custom labware', { error })
        )
        break
      }

      case CustomLabware.CHANGE_CUSTOM_LABWARE_DIRECTORY: {
        const { labware: config } = getFullConfig()
        const dialogOptions = { defaultPath: config.directory }
        const mainWindow = getMainWindow()

        if (mainWindow === null) {
          log.warn(
            'No main window present, unable to change custom labware directory'
          )
          break
        }

        showOpenDirectoryDialog(mainWindow, dialogOptions)
          .then(filePaths => {
            if (filePaths.length > 0) {
              const dir = filePaths[0]
              dispatch(
                ConfigActions.updateConfigValue('labware.directory', dir)
              )
            }
          })
          .catch(error =>
            log.error(
              'Error showing directory dialog to change custom labware directory',
              { error }
            )
          )

        break
      }

      case CustomLabware.ADD_CUSTOM_LABWARE: {
        const mainWindow = getMainWindow()
        let addLabwareTask

        if (mainWindow === null) {
          log.warn('No main window present, unable to add custom labware')
          break
        }

        if (action.payload.overwrite !== null) {
          addLabwareTask = overwriteLabware(dispatch, action.payload.overwrite)
        } else {
          const dialogOptions = {
            defaultPath: app.getPath('downloads'),
            filters: [
              { name: 'JSON Labware Definitions', extensions: ['json'] },
            ],
          }

          addLabwareTask = showOpenFileDialog(mainWindow, dialogOptions).then(
            filePaths => {
              if (filePaths.length > 0) {
                return copyLabware(dispatch, filePaths)
              }
            }
          )
        }

        addLabwareTask.catch((error: Error) => {
          dispatch(CustomLabware.addCustomLabwareFailure(null, error.message))
        })

        break
      }

      case CustomLabware.OPEN_CUSTOM_LABWARE_DIRECTORY: {
        const dir = getFullConfig().labware.directory
        shell.openItem(dir)
        break
      }
    }
  }
}
