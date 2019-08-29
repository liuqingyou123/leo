const traverse = require('babel-traverse').default
const generate = require('babel-generator').default
const babelCore = require('babel-core')
const t = require('babel-types')
const parse = babelCore.transform

console.log('generate', generate)
const LEO_PACKAGE_NAME = '@leojs/leo'

module.exports = function transform(options) {
  let code = options.code
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
  let result = { code }

  traverse(ast, {
    ClassDeclaration (path) {
      mainClass = path
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
    },
    Program: {
      exit (path) {
        
      }
    }
  })

  mainClass.scope.rename('Component', '__BaseComponent')

  code = generate(ast).code
  result = { code }

  return result
}
