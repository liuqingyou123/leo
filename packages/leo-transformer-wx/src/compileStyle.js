const path = require('path')
const fs = require('fs-extra')
const _ = require('lodash')
const postcss = require('postcss').default
const pxtransform = require('postcss-pxtransform').default

module.exports = function compileStyle(path) {
  let content = fs.readFileSync(path).toString()
  return content
}