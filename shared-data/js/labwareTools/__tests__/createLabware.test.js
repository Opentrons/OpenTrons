import omit from 'lodash/omit'
import range from 'lodash/range'

import { createRegularLabware } from '../index.js'

import fixture_regular_example_1 from '../../../labware/fixtures/2/fixture_regular_example_1.json'
import fixture_regular_example_2 from '../../../labware/fixtures/2/fixture_regular_example_2.json'

// NOTE: loadName needs to be replaced here b/c fixture has a non-default loadName
const exampleLabware1 = {
  ...fixture_regular_example_1,
  parameters: {
    ...fixture_regular_example_1.parameters,
    loadName: 'opentrons_2_wellplate_100ul',
  },
}

const exampleLabware2 = {
  ...fixture_regular_example_2,
  parameters: {
    ...fixture_regular_example_2.parameters,
    loadName: 'generic_6_wellplate_1ml',
  },
}

describe('createLabware', () => {
  let labware1
  let labware2
  let well1
  let well2

  beforeEach(() => {
    well1 = omit(exampleLabware1.wells.A1, ['x', 'y', 'z'])
    well2 = omit(exampleLabware2.wells.A1, ['x', 'y', 'z'])
    const offset1 = { x: 10, y: 10, z: 55 }
    const offset2 = { x: 10, y: 10, z: 50 }
    labware1 = createRegularLabware({
      metadata: exampleLabware1.metadata,
      parameters: exampleLabware1.parameters,
      dimensions: exampleLabware1.dimensions,
      offset: offset1,
      grid: { row: 1, column: 2 },
      spacing: { row: 10, column: 10 },
      well: well1,
      brand: exampleLabware1.brand,
      namespace: 'fixture',
    })

    labware2 = createRegularLabware({
      metadata: exampleLabware2.metadata,
      parameters: exampleLabware2.parameters,
      dimensions: exampleLabware2.dimensions,
      offset: offset2,
      grid: { row: 3, column: 2 },
      spacing: { row: 9, column: 9 },
      well: well2,
      namespace: 'fixture',
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('snapshot tests', () => {
    expect(labware1).toEqual(exampleLabware1)
    expect(labware2).toEqual(exampleLabware2)
  })

  test('ordering generates as expected', () => {
    expect(exampleLabware2.ordering).toEqual(labware2.ordering)
  })

  test('well XYZ generates correctly', () => {
    const spacing = { row: 11.8, column: 12.1 }
    const grid = { row: 8, column: 12 }
    const offset = { x: 10, y: 10, z: 55 }
    const labware3 = createRegularLabware({
      metadata: exampleLabware2.metadata,
      parameters: exampleLabware2.parameters,
      dimensions: exampleLabware2.dimensions,
      offset,
      grid,
      spacing,
      well: well2,
    })

    const expectedXByCol = range(
      offset.x,
      grid.column * spacing.column + offset.x,
      spacing.column
    )
    const expectedYByRow = range(
      offset.y,
      grid.row * spacing.row + offset.y,
      spacing.row
    ).reverse()
    labware3.ordering.forEach((column, cIndex) => {
      column.forEach((wellName, rIndex) => {
        const well = labware3.wells[wellName]
        expect(well.x).toBeCloseTo(expectedXByCol[cIndex], 2)
        expect(well.y).toBeCloseTo(expectedYByRow[rIndex], 2)
        expect(well.z).toBeCloseTo(offset.z - well.depth, 2)
      })
    })
  })
})
