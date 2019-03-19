// @flow
import Ajv from 'ajv'
import range from 'lodash/range'
import round from 'lodash/round'

import assignId from './assignId'
import {toWellName, sortWells, splitWellsOnColumn} from '../helpers/index'
import labwareSchema from '../../labware-json-schema/labware-schema.json'
import {SLOT_WIDTH_MM, SLOT_LENGTH_MM} from '../constants'

import type {
  LabwareDefinition2 as Definition,
  LabwareMetadata as Metadata,
  LabwareDimensions as Dimensions,
  LabwareBrand as Brand,
  LabwareParameters as Params,
  LabwareWell as Well,
  LabwareOffset as Offset,
} from '../types'

type Cell = {
  row: number,
  column: number,
}

// This represents creating a "range" of well names with step intervals included
// For example, starting at well "A1" with a column stride of 2 would result in
// the grid name being ordered as: "A1", "B1"..."A3", "B3"..etc
type GridStart = {
  rowStart: string,
  colStart: string,
  rowStride: number,
  colStride: number,
}

export type RegularLabwareProps = {
  metadata: Metadata,
  parameters: Params,
  offset: Offset,
  dimensions: Dimensions,
  grid: Cell,
  spacing: Cell,
  well: Well,
  brand?: Brand,
}

export type IrregularLabwareProps = {
  metadata: Metadata,
  parameters: Params,
  offset: Array<Offset>,
  dimensions: Dimensions,
  grid: Array<Cell>,
  spacing: Array<Cell>,
  well: Array<Well>,
  gridStart: Array<GridStart>,
  brand?: Brand,
}

const ajv = new Ajv({allErrors: true, jsonPointers: true})
const validate = ajv.compile(labwareSchema)

function validateDefinition (definition: Definition) {
  const valid = validate(definition)

  if (!valid) {
    console.error(validate.errors)
    throw new Error('Produced invalid labware definition; check inputs')
  }

  return definition
}

export function _irregularWellName (
  rowIdx: number,
  colIdx: number,
  gridStart: GridStart
) {
  const rowNum =
    rowIdx * gridStart.rowStride + gridStart.rowStart.charCodeAt(0) - 65
  const colNum = colIdx * gridStart.colStride + parseInt(gridStart.colStart) - 1
  return toWellName({rowNum, colNum})
}

export function _calculateWellCoord (
  rowIdx: number,
  colIdx: number,
  spacing: Cell,
  offset: Offset,
  wells: Well
) {
  return {
    ...wells,
    x: round(colIdx * spacing.column + offset.x, 2),
    y: round(rowIdx * spacing.row + offset.y, 2),
    z: round(offset.z - wells.depth, 2),
  }
}

function determineLayout (
  grids: Array<Cell>,
  spacing: Array<Cell>,
  offset: Array<Offset>,
  gridStart: Array<GridStart>,
  wells: Array<Well>
): {[wellName: string]: Well} {
  const wellMap = {}
  grids.forEach((gridObj, gridIdx) => {
    const reverseRowIdx = range(gridObj.row - 1, -1)
    range(gridObj.column).forEach(colIdx => {
      range(gridObj.row).forEach(rowIdx => {
        const wellName = _irregularWellName(rowIdx, colIdx, gridStart[gridIdx])
        wellMap[wellName] = _calculateWellCoord(
          reverseRowIdx[rowIdx],
          colIdx,
          spacing[gridIdx],
          offset[gridIdx],
          wells[gridIdx]
        )
      })
    })
  })
  return wellMap
}

export function _generateIrregularLoadName (args: {
  grid: Array<Cell>,
  well: Array<Well>,
  units: string,
  brand: string,
  displayCategory: string,
}): string {
  const {grid, well, units, brand, displayCategory} = args
  const wellComboArray = grid.map((gridObj, gridIdx) => {
    const numWells = gridObj.row * gridObj.column
    // TODO Ian 2018-11-08: use units to convert volume
    return `${numWells}x${well[gridIdx].totalLiquidVolume}_${units}`
  })

  return [brand, wellComboArray.join('_'), displayCategory]
    .join('_')
    .replace(' ', '_')
    .toLowerCase()
}

// Decide order of wells for single grid containers
function determineOrdering (grid: Cell): Array<Array<string>> {
  const ordering = range(grid.column).map(colNum =>
    range(grid.row).map(rowNum => toWellName({rowNum, colNum}))
  )

  return ordering
}

// Decide order of wells for multi-grid containers
export function determineIrregularOrdering (
  wellsArray: Array<string>
): Array<Array<string>> {
  const sortedArray = wellsArray.sort(sortWells)
  const ordering = splitWellsOnColumn(sortedArray)

  return ordering
}

// Private helper functione to calculate the XYZ coordinates of a give well
// Will return a nested object of all well objects for a labware
function calculateCoordinates (
  well: Well,
  ordering: Array<Array<string>>,
  spacing: Cell,
  offset: Offset
): {[wellName: string]: Well} {
  // Note, reverse() on its own mutates ordering. Use slice() as a workaround
  // to prevent mutation
  return ordering.reduce((wells, column, cIndex) => {
    column
      .slice()
      .reverse()
      .forEach((element, rIndex) => {
        wells[element] = {
          ...well,
          x: round(cIndex * spacing.column + offset.x, 2),
          y: round(rIndex * spacing.row + offset.y, 2),
          z: round(offset.z - well.depth, 2),
        }
      })
    return wells
  }, {})
}

export function _calculateCornerOffset (dimensions: Dimensions): Offset {
  return {
    x: round(SLOT_LENGTH_MM - dimensions.overallLength, 2),
    y: round(SLOT_WIDTH_MM - dimensions.overallWidth, 2),
    z: 0,
  }
}

function ensureBrand (brand?: Brand): Brand {
  return brand || {brand: 'generic'}
}

// Generator function for labware definitions within a regular grid format
// e.g. well plates, regular tuberacks (NOT 15_50ml) etc.
// For further info on these parameters look at labware examples in __tests__
// or the labware definition schema in labware-json-schema
export function createRegularLabware (args: RegularLabwareProps): Definition {
  const {metadata, parameters, offset, dimensions, grid, spacing, well} = args
  const ordering = determineOrdering(grid)
  const numWells = grid.row * grid.column
  const brand = ensureBrand(args.brand)

  const definition: Definition = {
    ordering,
    brand,
    metadata,
    dimensions,
    parameters,
    otId: assignId(),
    deprecated: false,
    cornerOffsetFromSlot: _calculateCornerOffset(dimensions),
    wells: calculateCoordinates(well, ordering, spacing, offset),
  }

  definition.parameters.loadName = [
    brand.brand,
    numWells,
    metadata.displayCategory,
    well.totalLiquidVolume,
    metadata.displayVolumeUnits,
  ]
    .join('_')
    .toLowerCase()

  return validateDefinition(definition)
}

// Generator function for labware definitions within an irregular grid format
// e.g. crystalization plates, 15_50ml tuberacks and anything with multiple "grids"
export function createIrregularLabware (
  args: IrregularLabwareProps
): Definition {
  const {metadata, offset, dimensions, grid, spacing, well, gridStart} = args
  const wells = determineLayout(grid, spacing, offset, gridStart, well)
  const ordering = determineIrregularOrdering(Object.keys(wells))
  const brand = ensureBrand(args.brand)
  const parameters = {...args.parameters, format: 'irregular'}

  const definition: Definition = {
    wells,
    ordering,
    brand,
    metadata,
    dimensions,
    parameters,
    otId: assignId(),
    deprecated: false,
    cornerOffsetFromSlot: _calculateCornerOffset(dimensions),
  }

  // generate loadName based on numwells per grid type
  definition.parameters.loadName = _generateIrregularLoadName({
    grid,
    well,
    units: metadata.displayVolumeUnits,
    displayCategory: metadata.displayCategory,
    brand: brand.brand,
  })

  return validateDefinition(definition)
}
