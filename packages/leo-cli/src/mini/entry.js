const path = require('path')
const fs = require('fs-extra')
const { getBuildData, setAppConfig } = require('./helper')
const { printLog } = require('../../../util')
const { processTypeEnum } = require('../../../util/constants')
const wxTransformer = require('../../../leo-transformer-wx')

module.exports = async function buildEntry() {
  const {
    entryFileName,
    sourceDirName,
    entryFilePath,
    sourceDir,
    outputDir,
    outputDirName,
    buildAdapter,
    projectConfig
  } = getBuildData()

  const entryFileCode = fs.readFileSync(entryFilePath).toString()
  const outputEntryFilePath = path.join(outputDir, entryFileName)
  console.log(' ')
  printLog(processTypeEnum.COMPILE, '入口文件', `${sourceDirName}/${entryFileName}`)
  const transformResult = wxTransformer({
    code: entryFileCode,
    sourceDir,
    outputDir,
    projectConfig,
    isEntry: true
  })

  // let code = options.code
  // let sourceDir = options.sourceDir
  // let projectConfig = options.projectConfig
  // let isEntry = options.isEntry

  setAppConfig(JSON.parse(transformResult.configObj))
  console.log(' ')
  fs.writeFileSync(path.join(outputDir, 'app.json'), transformResult.configObj)
  printLog(processTypeEnum.GENERATE, '入口配置', `${outputDirName}/app.json`)
  fs.writeFileSync(path.join(outputDir, 'app.js'), transformResult.code)
  printLog(processTypeEnum.GENERATE, '入口文件', `${outputDirName}/app.js`)
  fs.writeFileSync(path.join(outputDir, 'app.wxss'), transformResult.style)
  printLog(processTypeEnum.GENERATE, '入口样式', `${outputDirName}/app.wxss`)
  console.log(' ')
}