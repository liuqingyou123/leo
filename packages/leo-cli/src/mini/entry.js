const path = require('path')
const fs = require('fs-extra')
const { getBuildData } = require('./helper')
const { printLog } = require('../util/index')
const { processTypeEnum } = require('../util/constants')
const wxTransformer = require('../../../leo-transformer-wx')

exports.buildEntry = async () => {
  const {
    entryFileName,
    sourceDirName,
    entryFilePath,
    sourceDir,
    outputDir,
    outputDirName,
    buildAdapter
  } = getBuildData()

  const entryFileCode = fs.readFileSync(entryFilePath).toString()
  const outputEntryFilePath = path.join(outputDir, entryFileName)

  printLog(processTypeEnum.COMPILE, '入口文件', `${sourceDirName}/${entryFileName}`)
  const transformResult = wxTransformer({
    code: entryFileCode,
    sourceDir,
    sourcePath: entryFilePath,
    outputEntryFilePath,
    adapter: buildAdapter
  })

  let resCode = transformResult.code

  fs.writeFileSync(path.join(outputDir, 'app.js'), resCode)
  printLog(processTypeEnum.GENERATE, '入口文件', `${outputDirName}/app.js`)

}