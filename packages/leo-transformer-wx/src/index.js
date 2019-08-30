const path = require('path')
const fs = require('fs-extra')
const traverse = require('babel-traverse').default
const generate = require('babel-generator').default
const babelCore = require('babel-core')
const template = require('babel-template')
const t = require('babel-types')
const { processTypeEnum } = require('../../util/constants')
const { printLog } = require('../../util')
const compileStyle = require('./compileStyle')

const nodePath = path
const parse = babelCore.transform
const LEO_NAME = 'Leo'
const LEO_PACKAGE_NAME = '@leojs/leo'
const WEAPPPAH = './npm/leo/index.js'
const WEPAGEPARH = '../../npm/leo/index.js'
const CREATE_DATA = '_createData'
const babylonConfig = {
  sourceType: 'module',
  plugins: [
    'typescript',
    'classProperties',
    'jsx',
    'trailingFunctionCommas',
    'asyncFunctions',
    'exponentiationOperator',
    'asyncGenerators',
    'objectRestSpread',
    'decorators',
    'dynamicImport'
  ]
}

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
  let sourceDir = options.sourceDir
  let projectConfig = options.projectConfig
  let isEntry = options.isEntry

  copyWeapp(options.outputDir, options.weappPath)

  const ast = parse(code, { parserOpts: babylonConfig }).ast

  let mainClass = null
  let configObj = null
  let style = null
  let result = {}

  traverse(ast, {
    ClassDeclaration (path) {
      mainClass = path
    },
    ClassMethod (path) {
      if (t.isIdentifier(path.node.key)) {
        if (path.node.key.name === 'render') {
          path.node.key.name = CREATE_DATA
        }
      }
    },
    ClassProperty (path) {
      const keyName = path.node.key.name
      if (keyName === 'config') {
        configObj = JSON.stringify(eval('(' + generate(path.node.value).code+ ')'), null, 2)
      }
    },
    ImportDeclaration (path) {
      const source = path.node.source.value
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
      if (/css$/.test(source)) {
        let cssPath = nodePath.join(sourceDir, source)
        style = compileStyle(cssPath, projectConfig)
        path.remove()
      }
    },
    CallExpression(path) {
      const callee = path.node.callee
      if (callee.object.name === LEO_NAME && callee.property.name === 'render') {
        path.remove()  // 移除 Leo.render(<App />, document.getElementById('app'));
      }
    },
    Program: {
      exit (astPath) {
        astPath.traverse({
          ClassDeclaration (path) {
            const node = path.node
            let hasCreateData = false
            if (node.superClass) {  // 该类有extend关键字
              path.traverse({
                ClassMethod (astPath) {
                  if (astPath.get('key').isIdentifier({ name: '_createData' })) {
                    hasCreateData = true
                  }
                }
              })
              if (hasCreateData) {
                let className = node.id.name
                if (className === 'App') {
                  node.id.name = className = '_App'
                }
                astPath.node.body.push(template(`export default ${className}`, babylonConfig)())
                if (isEntry) {
                  astPath.node.body.push(template(`App(require('${WEAPPPAH}').default.createApp(${className}))`, babylonConfig)())
                } else {
                  astPath.node.body.push(template(`Component(require('${WEPAGEPARH}').default.createApp(${className}))`, babylonConfig)())
                }
              }
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
  result.configObj = configObj
  result.style = style

  return result
}
