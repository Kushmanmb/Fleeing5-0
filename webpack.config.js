const path = require('path');

module.exports = {
  entry: './Fleeing 5-0/fleeing_5_0_final_rebuild_animated_sound.zip (Unzipped Files)/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production'
};
