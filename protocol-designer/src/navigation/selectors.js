// @flow
import type {BaseState, Selector} from '../types'
// import {createSelector} from 'reselect'

import {rootSelector as navigationRootSelector} from './reducers'
import {selectors as labwareIngredSelectors} from '../labware-ingred/reducers'
// import {selectors as steplistSelectors} from '../steplist/reducers'

import type {Page} from './types'

export const newProtocolModal = (state: BaseState) =>
  navigationRootSelector(state).newProtocolModal

export const wellSelectionModal = (state: BaseState) =>
  navigationRootSelector(state).wellSelectionModal

export const currentPage: Selector<Page> = (state: BaseState) => {
  // If we're in ingredient detail mode, override the nav button page state
  const ingredDetailMode = labwareIngredSelectors.selectedContainer(state) && !wellSelectionModal(state)
  const page = navigationRootSelector(state).page

  return ingredDetailMode ? 'ingredient-detail' : page
}
