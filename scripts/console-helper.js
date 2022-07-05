const Chalk = require('chalk')
const ConsolePrefix = Chalk.blueBright.bold('○  ')

const tooltip = (type, value) => {
  console.log(
    ConsolePrefix + Chalk.greenBright(String(type).padEnd(10, ' ')) + Chalk.magentaBright(value)
  )
}

module.exports = {
  tooltip
}
