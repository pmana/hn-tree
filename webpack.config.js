const path = require('path');

module.exports = {
  entry: './src/hn-tree.js',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      { test: path.join(__dirname, 'src'),
        loader: 'babel-loader' },
    ],
  },
};
