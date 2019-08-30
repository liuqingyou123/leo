const path = require('path')
const fs = require('fs-extra')
const { getBuildData } = require('./helper')
const { printLog } = require('../../../util')
const { processTypeEnum } = require('../../../util/constants')
const wxTransformer = require('../../../leo-transformer-wx')


function buildSinglePage(page) {
  const {
    sourceDir,
    sourceDirName
  } = getBuildData()
  const pagePath = path.join(sourceDir, `${page}`)
  const pageJs = `${pagePath}.jsx`

  printLog(processTypeEnum.COMPILE, '页面文件', `${sourceDirName}/${page}`)
  const pageJsContent = fs.readFileSync(pageJs).toString()
  // console.log('pageJsContent', pageJsContent)
  const outputPagePath = path.dirname(pagePath)
  const outputPageJSONPath = `${pagePath}.json`
  const outputPageWXMLPath = `${pagePath}.wxml`
  const outputPageWXSSPath = `${pagePath}.wxss`

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