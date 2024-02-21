const path = require('path');

module.exports = {
  entry: './static/js/index.js',
  output: {
    filename: 'webpacked.min.js',
    path: path.resolve(__dirname, 'dist'),
  },
};