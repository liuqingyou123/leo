const path = require('path')
const fs = require('fs-extra')
const { getBuildData, setAppConfig } = require('./helper')
const { printLog } = require('../../../util')
const { processTypeEnum } = require('../../../util/constants')
const wxTransformer = require('../../../leo-transformer-wx')
const babel = require('../../../util/babel')

module.exports = async function buildEntry() {
  const {
    entryFileName,
    sourceDirName,
    entryFilePath,
    sourceDir,
    outputDir,
    outputDirName,
    projectConfig
  } = getBuildData()

  const entryFileCode = fs.readFileSync(entryFilePath).toString()
  console.log(' ')
  printLog(processTypeEnum.COMPILE, '入口文件', `${sourceDirName}/${entryFileName}`)
  const transformResult = wxTransformer({
    code: entryFileCode,
    sourceDir,
    outputDir,
    projectConfig,
    isEntry: true
  })

  setAppConfig(JSON.parse(transformResult.configObj))
  console.log(' ')

  let resCode = await babel(transformResult.code, path.join(outputDir, 'app.js'))
  transformResult.code = resCode.code
  fs.writeFileSync(path.join(outputDir, 'app.json'), transformResult.configObj)
  printLog(processTypeEnum.GENERATE, '入口配置', `${outputDirName}/app.json`)
  fs.writeFileSync(path.join(outputDir, 'app.js'), transformResult.code)
  printLog(processTypeEnum.GENERATE, '入口文件', `${outputDirName}/app.js`)
  fs.writeFileSync(path.join(outputDir, 'app.wxss'), transformResult.style)
  printLog(processTypeEnum.GENERATE, '入口样式', `${outputDirName}/app.wxss`)
  console.log(' ')
}