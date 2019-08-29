const path = require('path')
const fs = require('fs-extra')
const traverse = require('babel-traverse').default
const generate = require('babel-generator').default
const babelCore = require('babel-core')
const t = require('babel-types')
const { processTypeEnum } = require('../../util/constants')
const { printLog } = require('../../util')

const parse = babelCore.transform
const LEO_PACKAGE_NAME = '@leojs/leo'
const WEAPPPAH = './npm/leo/index.js'

/**
 * 复制leo-weapp文件至dist目录
 * 
 * @param {*} outputDir
 */
function copyWeapp(outputDir) {
  const fileContent = fs.readFileSync(path.join(__dirname, '../../leo-weapp/index.js')).toString()
  const outputNpmPath = path.join(outputDir, WEAPPPAH)
  fs.ensureDirSync(path.dirname(outputNpmPath))
  fs.writeFileSync(outputNpmPath, fileContent)
  printLog(processTypeEnum.COPY, 'NPM文件', outputNpmPath)
}

module.exports = function transform(options) {
  let code = options.code
  const isEntry = options.isEntry

  copyWeapp(options.outputDir, options.weappPath)

  const ast = parse(code, {
    parserOpts: {
      sourceType: 'module',
      plugins: [
        'classProperties',
        'jsx',
        'flow',
        'flowComment',
        'trailingFunctionCommas',
        'asyncFunctions',
        'exponentiationOperator',
        'asyncGenerators',
        'objectRestSpread',
        'decorators',
        'dynamicImport',
        'doExpressions',
        'exportExtensions'
      ]
    }
  }).ast

  let mainClass = null
  let result = {}

  traverse(ast, {
    ClassDeclaration (path) {
      mainClass = path
    },
    ImportDeclaration (path) {
      const source = path.node.source.value
      console.log('source', source)
      path.traverse({
        ImportSpecifier (path) {
          const name = path.node.imported.name
          if (source === LEO_PACKAGE_NAME && name === 'Component') {
            path.node.local = t.identifier('__BaseComponent')
          }
        }
      })
      if (source === LEO_PACKAGE_NAME) {
        path.node.source.value = WEAPPPAH
      }
    },
    Program: {
      exit (astPath) {
        astPath.traverse({
          Identifier (path) {
            if (path.node.name === 'App') {
              path.node.name = '_App'
            }
          },
        })
      }
    }
  })

  mainClass.scope.rename('Component', '__BaseComponent')

  code = generate(ast).code
  // console.log('code', code)
  result.code = code

  return result
}
