const traverse = require('babel-traverse').default
const generate = require('babel-generator').default
const babelCore = require('babel-core')
const template = require('babel-template')
const t = require('babel-types')
const { buildBlockElement } = require('../../util')
const { IS_LEO_READY } = require('../../util/constants')


function generateJSXAttr (ast) {
  const code = generate(ast).code
  return code.replace(/(this\.props\.)|(this\.state\.)/g, '')
    .replace(/(props\.)|(state\.)/g, '')
    .replace(/this\./g, '')
}

function parseJSXElement(element) {
  const children = element.children
  const { attributes, name } = element.openingElement
  const componentName = name.name
  let attributesTrans = {}


}

module.exports = function compileRender (renderPath, initState) {
  let finalReturnElement = null
  let outputTemplate = null
  renderPath.traverse({
    JSXElement (path) {
      if (t.isReturnStatement(path.parent) && !finalReturnElement) {
        const block = buildBlockElement([
          t.jSXAttribute(
            t.jSXIdentifier('wx-if'),
            t.jSXExpressionContainer(t.jSXIdentifier(IS_LEO_READY))
          )
        ])
        finalReturnElement = block
        block.children.push(path.node)
        outputTemplate = parseJSXElement(block)
        path.replaceWith(block)
      }
    },
    JSXAttribute (path) {
      const node = path.node
      const value = path.node.value
      const attributeName = node.name.name
      if (attributeName === 'className') {
        path.node.name.name = 'class'
      }
      if (attributeName === 'onClick' && t.isJSXExpressionContainer(value)) {
        console.log('123', generateJSXAttr(value))
        path.node.name.name = 'bindtap'
      }
    }
  })
  console.log('code', generate(renderPath.node).code)
  return ''
}