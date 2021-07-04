// webpack base config
'use strict'

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const rules = require('./rules')
const { DEV_MODE, ENABLE_ANALYZER, DEFAULT_PORT } = require('./env')

module.exports = {
  target: 'web',

  output: {
    filename: DEV_MODE ? 'bundle.js' : 'bundle.[contenthash].js',
  },

  mode: DEV_MODE ? 'development' : 'production',

  devtool: DEV_MODE ? 'eval-source-map' : 'source-map',

  module: {
    rules: [
      rules.js,
      rules.globalCss,
      rules.localCss,
      rules.handlebars,
      rules.fonts,
      rules.images,
      rules.videos,
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: DEV_MODE ? '[name].css' : '[name].[contenthash].css',
      chunkFilename: DEV_MODE ? '[id].css' : '[id].[contenthash].css',
    }),
    ENABLE_ANALYZER &&
      new BundleAnalyzerPlugin({ analyzerMode: 'server', openAnalyzer: true }),
  ].filter(Boolean),

  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.ts', '.tsx', '.json'],
  },

  optimization: {
    minimizer: [
      new TerserPlugin({ cache: true, parallel: true, sourceMap: true }),
      new OptimizeCSSAssetsPlugin({}),
    ],

    splitChunks: {
      cacheGroups: {
        // bundle CSS into one file
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },

  devServer: {
    historyApiFallback: true,
    port: DEFAULT_PORT,
    host: '0.0.0.0',
    hotOnly: true,
  },
}
