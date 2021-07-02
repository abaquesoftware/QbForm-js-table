const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

let config = {
  mode: 'development',
  //mode: 'production',
  entry: './src/QbfModule/QbfModule_Table.ts',
  output: {
    //path: path.resolve(__dirname, 'js'),
    filename: 'QbForm-table.js',
    publicPath: '/dist/',
    library: 'QbfTable', // The variable name to access the library
    libraryTarget: 'var', // The type of library, in this case var
    libraryExport: 'default'
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.ts?/,
        loader: 'tslint-loader',
        enforce: 'pre',
        exclude: [/node_modules/]
      },
      {
        test: /\.ts?/,
        loader: 'ts-loader',
        exclude: [/node_modules/]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    })
  ],
  
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          mangle: true,
          compress: true,
          output: {
              beautify: false,
              comments: false,
          }
        },
        //sourceMap: true,
        //exclude: [/\.min\.js$/gi]
        exclude: [/node_modules/gi , /src/gi]
    }),
    ],
  },
}

module.exports = config