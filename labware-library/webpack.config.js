'use strict'
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

const { baseConfig, DEV_MODE } = require('@opentrons/webpack-config')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

const pkg = require('./package.json')

const JS_ENTRY = path.join(__dirname, 'src/index.tsx')
const HTML_ENTRY = path.join(__dirname, 'src/index.hbs')
const OUT_PATH = path.join(__dirname, 'dist')

const LABWARE_LIBRARY_ENV_VAR_PREFIX = 'OT_LL'

const passThruEnvVars = Object.keys(process.env)
  .filter(v => v.startsWith(LABWARE_LIBRARY_ENV_VAR_PREFIX))
  .concat(['NODE_ENV', 'CYPRESS'])

const envVarsWithDefaults = {
  OT_LL_VERSION: pkg.version,
  OT_LL_BUILD_DATE: new Date().toUTCString(),
}

const envVars = passThruEnvVars.reduce(
  (acc, envVar) => ({ [envVar]: '', ...acc }),
  { ...envVarsWithDefaults }
)

const testAliases =
  process.env.CYPRESS === '1'
    ? {
        'file-saver': path.resolve(__dirname, 'cypress/mocks/file-saver.js'),
      }
    : {}

module.exports = merge(baseConfig, {
  entry: JS_ENTRY,

  output: {
    path: OUT_PATH,
    publicPath: '/',
  },

  plugins: [
    new webpack.EnvironmentPlugin(envVars),

    ...(DEV_MODE ? [new ReactRefreshWebpackPlugin()] : []),

    new HtmlWebpackPlugin({
      template: HTML_ENTRY,
      title: pkg.productName,
      description: pkg.description,
      author: pkg.author.name,
      gtmId: process.env.GTM_ID,
    }),

    new FaviconsWebpackPlugin({
      logo: './src/images/favicon-logo.png',
      prefix: 'icons-[hash]/',
      inject: true,
      background: '#fff',
      icons: {
        android: false,
        appleIcon: false,
        appleStartup: false,
        coast: false,
        favicons: true,
        firefox: false,
        windows: false,
        yandex: false,
      },
    }),
  ],

  resolve: {
    alias: testAliases,
  },
})
