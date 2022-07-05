const Path = require('path')

module.exports = {
  moduleNameMapper: {
    d3: Path.join(__dirname, '../../node_modules/d3/dist/d3.min.js')
  },
  transform: {}
}
