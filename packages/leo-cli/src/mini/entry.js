const { getBuildData } = require('./helper')
const { printLog } = require('../util/index')
const { processTypeEnum } = require('../util/constants')
const transform = require('../../../leo-transformer-wx')

exports.buildEntry = async () => {
  const {
    entryFileName,
    sourceDirName,
  } = getBuildData()

  printLog(processTypeEnum.COMPILE, '入口文件', `${sourceDirName}/${entryFileName}`)
  console.log('123', transform)
}