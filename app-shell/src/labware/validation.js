// @flow
import Ajv, { DefinedError } from 'ajv'
import sortBy from 'lodash/sortBy'
import labwareSchema from '@opentrons/shared-data/labware/schemas/2.json'
import { sameIdentity } from './compare'

import {
  INVALID_LABWARE_FILE,
  DUPLICATE_LABWARE_FILE,
  OPENTRONS_LABWARE_FILE,
  VALID_LABWARE_FILE,
} from '@opentrons/app/src/redux/custom-labware/selectors'

import type { LabwareDefinition2 } from '@opentrons/shared-data'
import type {
  UncheckedLabwareFile,
  CheckedLabwareFile,
  ValidLabwareFile,
  OpentronsLabwareFile,
} from '@opentrons/app/src/redux/custom-labware/types'

const ajv = new Ajv()
const validateDefinition = ajv.compile(labwareSchema)

// TODO(mc, 2019-10-21): this code is somewhat duplicated with stuff in
// shared-data, but the shared-data validation function isn't geared towards
// this use case because it either throws or passes invalid files; align them
const validateLabwareDefinition = (
  data: any
): {| errors: Array<DefinedError>, definition: LabwareDefinition2 | null |} => {
  const valid = validateDefinition(data)
  return {
    definition: valid ? data : null,
    errors: validateDefinition.errors,
  }
}

// validate a collection of unchecked labware files
export function validateLabwareFiles(
  files: Array<UncheckedLabwareFile>
): Array<CheckedLabwareFile> {
  const validated = files.map<CheckedLabwareFile>(file => {
    const { filename, data, modified } = file

    // check file against the schema
    const { definition, errors } = validateLabwareDefinition(data)

    if (errors) {
      return { filename, modified, type: INVALID_LABWARE_FILE, errors }
    }

    const props = { filename, modified, definition }

    return definition?.namespace !== 'opentrons'
      ? ({ ...props, type: VALID_LABWARE_FILE }: ValidLabwareFile)
      : ({ ...props, type: OPENTRONS_LABWARE_FILE }: OpentronsLabwareFile)
  })

  return validated.map(v => {
    if (v.type === VALID_LABWARE_FILE) {
      const { type, ...props } = v

      // check for duplicates
      const duplicates = validated.filter(other => sameIdentity(v, other))

      // if there are duplicates and this labware isn't the oldest one
      // mark it as a duplicate
      if (duplicates.length > 1 && sortBy(duplicates, 'modified')[0] !== v) {
        return { type: DUPLICATE_LABWARE_FILE, ...props }
      }
    }

    return v
  })
}

// validate a new unchecked file against a collection of already checked files
export function validateNewLabwareFile(
  existing: Array<CheckedLabwareFile>,
  newFile: UncheckedLabwareFile
): CheckedLabwareFile {
  const [checkedNewFile] = validateLabwareFiles([newFile])

  if (
    checkedNewFile.type === VALID_LABWARE_FILE &&
    existing.some(e => sameIdentity(checkedNewFile, e))
  ) {
    const { type, ...props } = checkedNewFile
    return { type: DUPLICATE_LABWARE_FILE, ...props }
  }

  return checkedNewFile
}
