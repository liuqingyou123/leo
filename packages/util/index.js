const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const { processTypeMap } = require('./constants')

exports.printLog = function (type, tag, filePath) {
  const typeShow = processTypeMap[type]
  const tagLen = tag.replace(/[\u0391-\uFFE5]/g, 'aa').length
  const tagFormatLen = 8
  if (tagLen < tagFormatLen) {
    const rightPadding = new Array(tagFormatLen - tagLen + 1).join(' ')
    tag += rightPadding
  }
  const padding = ''
  filePath = filePath || ''
  if (typeof typeShow.color === 'string') {
    console.log(chalk[typeShow.color](typeShow.name), padding, tag, padding, filePath)
  } else {
    console.log(typeShow.color(typeShow.name), padding, tag, padding, filePath)
  }
}

const retries = (process.platform === 'win32') ? 100 : 1
exports.emptyDirectory = function (dirPath, opts = { excludes: [] }) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(file => {
      const curPath = path.join(dirPath, file)
      if (fs.lstatSync(curPath).isDirectory()) {
        let removed = false
        let i = 0 // retry counter
        do {
          try {
            if (!opts.excludes.length || !opts.excludes.some(item => curPath.indexOf(item) >= 0)) {
              emptyDirectory(curPath)
              fs.rmdirSync(curPath)
            }
            removed = true
          } catch (e) {
          } finally {
            if (++i < retries) {
              continue
            }
          }
        } while (!removed)
      } else {
        fs.unlinkSync(curPath)
      }
    })
  }
}