import path from 'path'
import { app } from 'electron'
import uuid from 'uuid/v4'

import type {
  Config,
  ConfigV0,
  ConfigV1,
  ConfigV2,
  ConfigV3,
  ConfigV4,
} from '@opentrons/app/src/redux/config/types'

// base config v0 defaults
// any default values for later config versions are specified in the migration
// functions for those version below
export const DEFAULTS_V0: ConfigV0 = {
  version: 0,
  devtools: false,
  reinstallDevtools: false,

  // app update config
  update: {
    channel: _PKG_VERSION_.includes('beta') ? 'beta' : 'latest',
  },

  buildroot: {
    manifestUrl:
      'https://opentrons-buildroot-ci.s3.us-east-2.amazonaws.com/releases.json',
  },

  // logging config
  log: {
    level: {
      file: 'debug',
      console: 'info',
    },
  },

  // ui and browser config
  ui: {
    width: 1024,
    height: 768,
    url: {
      protocol: 'file:',
      path: 'ui/index.html',
    },
    webPreferences: {
      webSecurity: true,
    },
  },

  // analytics (mixpanel)
  analytics: {
    appId: uuid(),
    optedIn: false,
    seenOptIn: false,
  },

  // user support (intercom)
  support: {
    userId: uuid(),
    createdAt: Math.floor(Date.now() / 1000),
    name: 'Unknown User',
    email: null,
  },

  // robot discovery
  discovery: {
    candidates: [],
  },

  // custom labware files
  labware: {
    directory: path.join(app.getPath('userData'), 'labware'),
  },

  alerts: {
    ignored: [],
  },

  // deprecated fields maintained for safety
  p10WarningSeen: {},
}

// config version 1 migration and defaults
const toVersion1 = (prevConfig: ConfigV0): ConfigV1 => {
  const nextConfig: ConfigV1 = {
    ...prevConfig,
    version: 1,
    discovery: {
      ...prevConfig.discovery,
      disableCache: false,
    },
  }

  return nextConfig
}

// config version 2 migration and defaults
const toVersion2 = (prevConfig: ConfigV1): ConfigV2 => {
  const nextConfig: ConfigV2 = {
    ...prevConfig,
    version: 2,
    calibration: {
      useTrashSurfaceForTipCal: null,
    },
  }

  return nextConfig
}

// config version 3 migration and defaults
const toVersion3 = (prevConfig: ConfigV2): ConfigV3 => {
  const nextConfig: ConfigV3 = {
    ...prevConfig,
    version: 3,
    support: {
      ...prevConfig.support,
      // name and email were never changed by the app, and its default values
      // were causing problems. Null them out for future implementations
      name: null,
      email: null,
    },
  }

  return nextConfig
}

// config version 4 migration and defaults
const toVersion4 = (prevConfig: ConfigV3): ConfigV4 => {
  const nextConfig: ConfigV4 = {
    ...prevConfig,
    version: 4,
    ui: { ...prevConfig.ui, externalBrowser: false },
  }

  return nextConfig
}

const MIGRATIONS: [
  (prefConfig: ConfigV0) => ConfigV1,
  (prefConfig: ConfigV1) => ConfigV2,
  (prefConfig: ConfigV2) => ConfigV3,
  (prefConfig: ConfigV3) => ConfigV4
] = [toVersion1, toVersion2, toVersion3, toVersion4]

export const DEFAULTS: Config = migrate(DEFAULTS_V0)

export function migrate(
  prevConfig: ConfigV0 | ConfigV1 | ConfigV2 | ConfigV3 | ConfigV4
): Config {
  // NOTE(mc, 2021-06-01): TS will never realistically by able
  // to track these types; ensure good unit test coverage
  let result: any = prevConfig

  while (result.version < MIGRATIONS.length) {
    result = MIGRATIONS[result.version](result)
  }

  return result as Config
}
