const path = require('path')
const fs = require('fs-extra')
const { setBuildData, getBuildData } = require('./helper')
const { BUILD_TYPES, processTypeEnum } = require('../util/constants')
const { printLog } = require('../util/index')

const { buildEntry } = require('./entry')

function buildProjectConfig() {
  const { buildAdapter, sourceDir, outputDir, outputDirName, appPath } = getBuildData()
  let projectConfigFileName = `project.${buildAdapter}.json`
  if (buildAdapter === BUILD_TYPES.WEAPP) {
    projectConfigFileName = 'project.config.json'
  }
  let projectConfigPath = path.join(appPath, projectConfigFileName)

  if (!fs.existsSync(projectConfigPath)) {
    projectConfigPath = path.join(sourceDir, projectConfigFileName)
    if (!fs.existsSync(projectConfigPath)) return
  }

  const origProjectConfig = fs.readJSONSync(projectConfigPath)
  fs.ensureDirSync(outputDir)
  fs.writeFileSync(
    path.join(outputDir, projectConfigFileName),
    JSON.stringify(Object.assign({}, origProjectConfig, { miniprogramRoot: './' }), null, 2)
  )
  printLog(processTypeEnum.GENERATE, '工具配置', `${outputDirName}/${projectConfigFileName}`)
}

exports.build = async (appPath, { adapter }) => {
  const buildData = setBuildData(appPath, adapter)
  fs.ensureDirSync(buildData.outputDir) // 创建dist 目录

  buildProjectConfig()
  await buildEntry()

}