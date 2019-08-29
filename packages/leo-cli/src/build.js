const path = require('path')
const _ = require('lodash')
const { BUILD_TYPES, PROJECT_CONFIG } = require('./util/constants')
const { emptyDirectory } = require('./util/index')

function buildForWeapp (appPath, { watch }) {
  require('./mini').build(appPath, {
    watch,
    adapter: BUILD_TYPES.WEAPP
  })
}

module.exports = function build(appPath, buildConfig) {
  const { type, watch } = buildConfig
  const configDir = require(path.join(appPath, PROJECT_CONFIG))(_.merge)
  const outputPath = path.join(appPath, configDir.outputRoot)

  emptyDirectory(outputPath)
 
  switch (type) {
    case BUILD_TYPES.WEAPP:
      buildForWeapp(appPath, {
        watch,
        adapter: BUILD_TYPES.WEAPP
      })
    break
  }
}
