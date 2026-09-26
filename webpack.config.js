const path = require('path');

module.exports = {
  entry: {
    symbols: './src/symbols.js',
    main: './src/main.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production'
};
