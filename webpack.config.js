/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const {name: pkgName} = require('./package.json')

const devMode = process.env.NODE_ENV !== 'production'

module.exports = {
  mode: process.env.NODE_ENV,
  devtool: devMode ? 'eval-source-map' : 'source-map',
  target: ['web', 'es5'],
  entry: {
    demo: './demo'
  },
  externals: {
    'video.js': {
      commonjs: 'video.js',
      commonjs2: 'video.js',
      root: 'videojs'
    }
  },
  module: {
    rules: [
      {
        exclude: devMode
          ? /node_modules\/(?!video-ad-sdk).*/
          : /node_modules\/.*/,
        loader: 'ts-loader',
        test: /\.ts/
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        defaultVendors: {
          reuseExistingChunk: true
        }
      }
    },
    removeEmptyChunks: true
  },
  output: {
    libraryTarget: 'umd',
    devtoolFallbackModuleFilenameTemplate: `webpack:///${pkgName}/[resource-path]?[hash]`,
    devtoolModuleFilenameTemplate: `webpack:///${pkgName}/[resource-path]`,
    publicPath: devMode ? 'http://localhost:9000/' : '../',
    path: path.resolve(__dirname, 'public/demo/')
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Video Ad SDK Suite Inspector',
      template: './demo/index.html',
      filename: 'index.html',
      minify: false,
      chunks: []
    }),
    new MiniCssExtractPlugin({
      filename: 'demo.css'
    })
  ],
  resolve: {
    extensions: ['.js', '.ts'],
    modules: ['node_modules'],
    alias: {
      'video-ad-sdk': devMode
        ? path.resolve(__dirname, 'src/index.js')
        : path.resolve(__dirname, 'dist/index.js')
    }
  },
  devServer: {
    compress: true,
    server: 'https',
    port: 9000,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}
