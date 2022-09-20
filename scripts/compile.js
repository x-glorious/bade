const ExecSh = require('exec-sh')
const Argv = require('./argv')
const ConsoleHelper = require('./console-helper')

ConsoleHelper.tooltip('Mode', Argv.isWatch ? 'watch' : 'once')
ConsoleHelper.tooltip('Scope', Argv.scope || '*')

const compileCommand = Argv.isWatch ? 'compile:watch' : 'compile'
const lernaScope = Argv.scope ? `--scope ${Argv.scope}` : ''

// 执行编译命令
ConsoleHelper.tooltip('Run', compileCommand + '\n')
ExecSh(`npx cross-env node_modules/.bin/lerna run ${compileCommand} ${lernaScope} --stream --parallel`)
