const path = require('path');

module.exports = {
  entry: ['./src/symbols.js', './src/main.js'],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production'
};
