import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { AppContainer } from 'react-hot-loader'

import configureStore from './configureStore.js'
import i18n from './localization'
import App from './components/App'
import {selectors as loadFileSelectors} from './load-file'
import {selectors as analyticsSelectors} from './analytics'
import {initializeAnalytics} from './analytics/integrations'
const store = configureStore()

if (process.env.NODE_ENV === 'production') {
  window.onbeforeunload = (e) => {
    // NOTE: the custom text will be ignored in modern browsers
    return loadFileSelectors.hasUnsavedChanges(store.getState()) ? i18n.t('alert.window.confirm_leave') : undefined
  }

  // Initialize analytics if user has already opted in
  if (analyticsSelectors.getHasOptedIn(store.getState())) {
    initializeAnalytics()
  }
}

function handleCheatCodes (e) {
  const key = e.key

  if (key === 'w') {
    moveSelectedStep(-1)
  } else if (key === 's') {
    moveSelectedStep(1)
  }
}

function moveSelectedStep (delta) {
  const orderedSteps = store.getState().steplist.orderedSteps
  const selectedItem = store.getState().steplist.selectedItem

  if (selectedItem.isStep) {
    const stepId = selectedItem.id
    const selectedIndex = orderedSteps.findIndex(s => s === stepId)

    store.dispatch({
      type: 'REORDER_STEP_CHEATCODE',
      payload: {
        nextIndex: selectedIndex + delta,
        stepId,
      },
    })
  } else {
    console.log('cannot do cheat code, no step selected')
  }
}

global.document.addEventListener('keydown', handleCheatCodes)
console.log('CHEAT CODES ENABLED! Use Ctrl + Up or Ctrl + Down with step selected')

const render = (Component) => {
  ReactDOM.render(
    <Provider store={store}>
      <AppContainer>
        <Component />
      </AppContainer>
    </Provider>,
    document.getElementById('root')
  )
}

render(App)

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./components/App', () => {
    render(App)
  })
}
