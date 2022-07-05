const Minimist = require('minimist')

// 解析参数
const argv = Minimist(process.argv.slice(2))

const isWatch = !!(argv['w'] || argv['watch'])
const scope = argv['scope'] || argv['s']

module.exports = {
  isWatch,
  scope
}
