const { transform } = require('babel-core')

const babelOptions = {
  sourceMap: true,
  presets: [
    'env'
  ],
  plugins: [
    require('babel-plugin-transform-react-jsx'),
    'transform-decorators-legacy',
    'transform-class-properties',
    'transform-object-rest-spread'
  ]
}

module.exports = function babel (content, file) {
  let p
  let config = babelOptions
  try {
    if (!config) config = {}
    config.filename = file
    const res = transform(content, config)
    p = Promise.resolve(res)
  } catch (e) {
    p = Promise.reject(e)
  }
  return p
}
