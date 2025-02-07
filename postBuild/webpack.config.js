const path = require('path');

module.exports = {
  entry: './static/js/index.js',
  output: {
    filename: './static/js/webpacked.min.js',
    path: path.resolve(__dirname, 'dist'),
  },
  target: ['web', 'es5'],
};