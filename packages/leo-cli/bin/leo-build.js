const path = require('path')
const program = require('commander')
const chalk = require('chalk')
const _ = require('lodash')
const build = require('../src/build')
const { PROJECT_CONFIG } = require('../../util/constants')

const appPath = process.cwd()
const projectConfPath = path.join(appPath, PROJECT_CONFIG)

program
  .option('--type [typeName]', 'Build type, weapp/h5')
  .option('--watch', 'Watch mode')
  .parse(process.argv)

const { type } = program

const projectConf = require(projectConfPath)(_.merge)
console.log(chalk.green(`开始编译项目 ${chalk.bold(projectConf.projectName)}`))
console.log(' ')

build(appPath, {
  type
})