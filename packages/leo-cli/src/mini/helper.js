
const path = require('path')
const _ = require('lodash')
const { PROJECT_CONFIG } = require('../util/constants')

let ENTRY = 'app.jsx'
let BuildData = {}

exports.setBuildData = (appPath, adapter) => {
  const configDir = path.join(appPath, PROJECT_CONFIG)
  const projectConfig = require(configDir)(_.merge)
  const sourceDirName = projectConfig.sourceRoot || CONFIG.SOURCE_DIR
  const outputDirName = projectConfig.outputRoot || CONFIG.OUTPUT_DIR
  const sourceDir = path.join(appPath, sourceDirName)
  const outputDir = path.join(appPath, outputDirName)
  const entryFilePath = path.join(sourceDir, ENTRY)
  const entryFileName = path.basename(entryFilePath)

  BuildData = {
    appPath,
    configDir,
    sourceDirName,
    sourceDir,
    outputDir,
    entryFilePath,
    entryFileName,
    buildAdapter: adapter
  }

  return BuildData
}

exports.getBuildData = () => BuildData