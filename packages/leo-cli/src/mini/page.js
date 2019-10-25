const path = require('path')
const fs = require('fs-extra')
const { getBuildData } = require('./helper')
const { printLog } = require('../../../util')
const { processTypeEnum } = require('../../../util/constants')
const wxTransformer = require('../../../leo-transformer-wx')
const babel = require('../../../util/babel')

async function buildSinglePage(page) {
  const {
    sourceDir,
    outputDir,
    sourceDirName,
    projectConfig
  } = getBuildData()
  const pagePath = path.join(sourceDir, `${page}`)
  const pageJs = `${pagePath}.jsx`
  const outPageDirPath = path.join(outputDir, page)

  printLog(processTypeEnum.COMPILE, '页面文件', `${sourceDirName}/${page}`)
  const pageJsContent = fs.readFileSync(pageJs).toString()
  // console.log('pageJsContent', pageJsContent)
  const outputPageJSPath = `${outPageDirPath}.js`
  const outputPageJSONPath = `${outPageDirPath}.json`
  const outputPageWXMLPath = `${outPageDirPath}.wxml`
  const outputPageWXSSPath = `${outPageDirPath}.wxss`

  const transformResult = wxTransformer({
    code: pageJsContent,
    sourceDir,
    outputDir,
    sourceDirPath: path.dirname(pagePath),
    projectConfig,
    isEntry: false
  })

  fs.ensureDirSync(path.dirname(outputPageJSPath))

  let resCode = await babel(transformResult.code, outputPageJSPath)
  transformResult.code = resCode.code
  fs.writeFileSync(outputPageJSONPath, transformResult.configObj)
  printLog(processTypeEnum.GENERATE, '页面配置', `${projectConfig.outputRoot}/${page}.json`)
  fs.writeFileSync(outputPageJSPath, transformResult.code)
  printLog(processTypeEnum.GENERATE, '页面逻辑', `${projectConfig.outputRoot}/${page}.js`)
  fs.writeFileSync(outputPageWXMLPath, transformResult.wxml)
  printLog(processTypeEnum.GENERATE, '页面模板', `${projectConfig.outputRoot}/${page}.wxml`)
  fs.writeFileSync(outputPageWXSSPath, transformResult.style)
  printLog(processTypeEnum.GENERATE, '页面样式', `${projectConfig.outputRoot}/${page}.wxss`)
}

module.exports = async function buildPages() {
  printLog(processTypeEnum.COMPILE, '所有页面')
  const { appConfig } = getBuildData()
  const pages = appConfig.pages || []
  const pagesPromises = pages.map(async page => {
    return buildSinglePage(page)
  })
  await Promise.all(pagesPromises)
}