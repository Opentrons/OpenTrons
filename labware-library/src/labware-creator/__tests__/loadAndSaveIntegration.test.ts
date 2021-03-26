import { labwareDefToFields } from '../labwareDefToFields'
import { fieldsToLabware } from '../fieldsToLabware'
import { labwareFormSchema } from '../labwareFormSchema'
import { DEFAULT_CUSTOM_NAMESPACE } from '@opentrons/shared-data'
// @ts-expect-error(2021-03-24): shared-data fixtures aren't proper LabwareDefinition2 type!
import fixture96Plate from '@opentrons/shared-data/labware/fixtures/2/fixture_96_plate'
// @ts-expect-error(2021-03-24): shared-data fixtures aren't proper LabwareDefinition2 type!
import fixture12Trough from '@opentrons/shared-data/labware/fixtures/2/fixture_12_trough'
import type { ProcessedLabwareFields } from '../fields'

jest.mock('../../definitions')

describe('load and immediately save integrity test', () => {
  const pipetteName = 'p10_single'
  const fakeDisplayName = 'Fake Display Name'
  const fakeLoadName = 'fake_load_name'

  // include "extraFields" that the user would have to set before being able to save a freshly-loaded definition
  // (without these fields, Yup schema cast would fail)
  const testCases = [
    {
      inputDef: fixture96Plate,
      extraFields: { pipetteName },
    },
    {
      inputDef: fixture12Trough,
      extraFields: { pipetteName },
    },
  ]
  testCases.forEach(({ inputDef, extraFields }) => {
    it(inputDef.parameters.loadName, () => {
      const initialRawFieldValues = labwareDefToFields(inputDef)
      // both name fields should be set to null upon import
      expect(initialRawFieldValues?.displayName).toBe(null)
      expect(initialRawFieldValues?.loadName).toBe(null)

      // to avoid making this test also test the name-defaulting behavior, we'll put in some fake name values for those fields
      const rawFieldValues = {
        ...initialRawFieldValues,
        displayName: fakeDisplayName,
        loadName: fakeLoadName,
        ...extraFields,
      }

      const processedFieldValues: ProcessedLabwareFields = labwareFormSchema.cast(
        rawFieldValues
      )
      const outputDef = fieldsToLabware(processedFieldValues)

      // We need to compensate for acceptable differences btw input def & output def.
      // Labware Creator...
      //   - does not save all original metadata fields, eg `metadata.tags`,
      //   - may set some fields to a fixed default value, eg namespace and displayVolumeUnits
      //   - may save empty arrays where original def had `undefined`s (brandId, quirks)
      //   - display name should be ignored b/c we don't want to test display-name-defaulting
      const tweakedInputDef = {
        ...inputDef,
        brand: {
          ...inputDef.brand,
          brandId: inputDef.brand.brandId || [],
        },
        parameters: {
          ...inputDef.parameters,
          format: 'irregular', // 'format' use is deprecated, LC always uses 'irregular'
          quirks: inputDef.parameters.quirks || [],
          loadName: fakeLoadName,
        },
        metadata: {
          ...inputDef.metadata,
          tags: [], // specifying this is not yet supported
          displayVolumeUnits: 'µL', // specifying this is not yet supported
          displayName: fakeDisplayName,
        },
        namespace: DEFAULT_CUSTOM_NAMESPACE, // specifying this is not yet supported
      }

      expect(outputDef).toEqual(tweakedInputDef)
    })
  })
})
