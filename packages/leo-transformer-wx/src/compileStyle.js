const fs = require('fs-extra')
const postcss = require('postcss')
const pxtransform = require('postcss-pxtransform')

module.exports = function compileStyle(path, config) {
  let css = fs.readFileSync(path).toString()
  let result = postcss([pxtransform(
    {
      platform: 'weapp',
      deviceRatio: config.deviceRatio,
      enable: true,
      config: {}
    }
  )]).process(css)
  return result.css
}