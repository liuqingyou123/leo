const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const generate = require('babel-generator').default
const t = require('babel-types')
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

const retries = (process.platform === 'win32') ? 100 : 2
function emptyDirectory (dirPath, opts = { excludes: [] }) {
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
            console.log(e)
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

exports.emptyDirectory = emptyDirectory

exports.buildBlockElement = function (attrs) {
  let blockName = 'block'
  return t.jSXElement(
    t.jSXOpeningElement(t.jSXIdentifier(blockName), attrs),
    t.jSXClosingElement(t.jSXIdentifier(blockName)),
    []
  )
}

exports.findMethodName =  (expression) => {
  let methodName
  if (
    t.isIdentifier(expression) ||
    t.isJSXIdentifier(expression)
  ) {
    methodName = expression.name
  } else if (t.isStringLiteral(expression)) {
    methodName = expression.value
  } else if (
    t.isMemberExpression(expression) &&
    t.isIdentifier(expression.property)
  ) {
    const { code } = generate(expression)
    const ids = code.split('.')
    if (ids[0] === 'this' && ids[1] === 'props' && ids[2]) {
      methodName = code.replace('this.props.', '')
    } else {
      methodName = expression.property.name
    }
  } else if (
    t.isCallExpression(expression) &&
    t.isMemberExpression(expression.callee) &&
    t.isIdentifier(expression.callee.object)
  ) {
    methodName = expression.callee.object.name
  } else if (
    t.isCallExpression(expression) &&
    t.isMemberExpression(expression.callee) &&
    t.isMemberExpression(expression.callee.object) &&
    t.isIdentifier(expression.callee.property) &&
    expression.callee.property.name === 'bind' &&
    t.isIdentifier(expression.callee.object.property)
  ) {
    methodName = expression.callee.object.property.name
  } else {
    throw codeFrameError(expression.loc, '当 props 为事件时(props name 以 `on` 开头)，只能传入一个 this 作用域下的函数。')
  }
  return methodName
}
