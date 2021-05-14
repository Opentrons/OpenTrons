import createHistory from 'history/createHashHistory'
import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

// oldest robot api state
import { robotReducer } from './robot'

// api state
import { robotApiReducer } from './robot-api/reducer'

// robot administration state
import { robotAdminReducer } from './robot-admin/reducer'

// robot controls state
import { robotControlsReducer } from './robot-controls/reducer'

// robot settings state
import { robotSettingsReducer } from './robot-settings/reducer'

// robot buildroot update state
import { buildrootReducer } from './buildroot/reducer'

// pipettes state
import { pipettesReducer } from './pipettes/reducer'

// modules state
import { modulesReducer } from './modules/reducer'

// networking state
import { networkingReducer } from './networking/reducer'

// app shell state
import { shellReducer } from './shell/reducer'

// config state
import { configReducer } from './config/reducer'

// discovery state
import { discoveryReducer } from './discovery/reducer'

// protocol state
import { protocolReducer } from './protocol/reducer'

// custom labware state
import { customLabwareReducer } from './custom-labware/reducer'

// system info state
import { systemInfoReducer } from './system-info/reducer'

// app-wide alerts state
import { alertsReducer } from './alerts/reducer'

// robot  calibration and (eventually) protocol sessions state
import { sessionReducer } from './sessions/reducer'

// calibration data state
import { calibrationReducer } from './calibration/reducer'

import type { Reducer } from 'redux'
import type { HashHistory } from 'history/createHashHistory'
import type { State, Action } from './types'

export const history: HashHistory = createHistory()

export const rootReducer: Reducer<State, Action> = combineReducers<_, Action>({
  robot: robotReducer,
  robotApi: robotApiReducer,
  robotAdmin: robotAdminReducer,
  robotControls: robotControlsReducer,
  robotSettings: robotSettingsReducer,
  buildroot: buildrootReducer,
  pipettes: pipettesReducer,
  modules: modulesReducer,
  networking: networkingReducer,
  config: configReducer,
  discovery: discoveryReducer,
  labware: customLabwareReducer,
  protocol: protocolReducer,
  shell: shellReducer,
  systemInfo: systemInfoReducer,
  alerts: alertsReducer,
  sessions: sessionReducer,
  calibration: calibrationReducer,
  router: connectRouter<_, Action>(history),
})
