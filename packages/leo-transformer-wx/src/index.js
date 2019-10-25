const path = require('path')
const fs = require('fs-extra')
const traverse = require('babel-traverse').default
const generate = require('babel-generator').default
const babelCore = require('babel-core')
const template = require('babel-template')
const t = require('babel-types')
const { processTypeEnum } = require('../../util/constants')
const { printLog } = require('../../util')
const { babylonConfig } = require('./config')
const compileStyle = require('./compileStyle')
const compileRender = require('./compileRender')

const nodePath = path
const parse = babelCore.transform
const LEO_NAME = 'Leo'
const LEO_PACKAGE_NAME = '@leojs/leo'
const LEO_COMPONENTS_NAME = '@leojs/components'
const WEAPPPAH = './npm/leo/index.js'
const WEPAGEPARH = '../../npm/leo/index.js'
const CREATE_DATA = '_createData'

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
  let outputDir = options.outputDir
  let sourceDirPath = options.sourceDirPath
  let projectConfig = options.projectConfig
  let isEntry = options.isEntry

  if (isEntry) {
    copyWeapp(outputDir)
  }

  const ast = parse(code, { parserOpts: babylonConfig }).ast

  let mainClass = null
  let configObj = null
  let outTemplate = null
  let style = null
  let result = {}
  let renderPath = null
  let initState = new Set() 

  traverse(ast, {
    ClassDeclaration (path) {
      mainClass = path
    },
    ClassMethod (path) {
      if (t.isIdentifier(path.node.key)) {
        const node = path.node
        const methodName = node.key.name
        if (methodName === 'render') {
          renderPath = path
          path.node.key.name = CREATE_DATA
        }
        if (methodName === 'constructor') {
          path.traverse({
            AssignmentExpression (p) {
              if (
                t.isMemberExpression(p.node.left) &&
                t.isThisExpression(p.node.left.object) &&
                t.isIdentifier(p.node.left.property) &&
                p.node.left.property.name === 'state' &&
                t.isObjectExpression(p.node.right)
              ) {
                const properties = p.node.right.properties
                properties.forEach(p => {
                  if (t.isObjectProperty(p) && t.isIdentifier(p.key)) {
                    initState.add(p.key.name)
                  }
                })
              }
            }
          })
        }
      }
    },
    ClassProperty (path) {
      const keyName = path.node.key.name
      if (keyName === 'config') {
        let config = eval('(' + generate(path.node.value).code+ ')')
        if (!isEntry) {
          config.usingComponents = {}
        }
        configObj = JSON.stringify(config, null, 2)
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
        path.node.source.value = isEntry ? WEAPPPAH : WEPAGEPARH
      }
      if (/css$/.test(source)) {
        let cssPath = nodePath.join(isEntry ? sourceDir : sourceDirPath, source)
        style = compileStyle(cssPath, projectConfig)
        path.remove()
      }
    },
    CallExpression(path) {
      const callee = path.node.callee
      if (callee.object && callee.object.name === LEO_NAME && callee.property.name === 'render') {
        path.remove()  // 移除 Leo.render(<App />, document.getElementById('app'));
      }
    },
    Program: {
      exit (astPath) {
        mainClass.scope.rename('Component', '__BaseComponent')
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

  outTemplate = compileRender(renderPath)
  ast.program.body = ast.program.body.filter(item => !(t.isImportDeclaration(item) && item.source.value === LEO_COMPONENTS_NAME))
  

  renderPath.traverse({
    BlockStatement (path) {
      path.node.body = []
      path.node.body.unshift(template('this.__state = arguments[0] || this.state || {};', babylonConfig)())
    }
  })

  code = generate(ast).code

  result.code = code
  result.configObj = configObj
  result.wxml = outTemplate
  result.style = style

  return result
}
