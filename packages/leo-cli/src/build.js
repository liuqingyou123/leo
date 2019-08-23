const { BUILD_TYPES } = require('./util/constants')

function buildForWeapp (appPath, { watch }) {
  require('./mini').build(appPath, {
    watch,
    adapter: BUILD_TYPES.WEAPP
  })
}

module.exports = function build(appPath, buildConfig) {
  const { type, watch } = buildConfig
 
  switch (type) {
    case BUILD_TYPES.WEAPP:
      buildForWeapp(appPath, {
        watch,
        adapter: BUILD_TYPES.WEAPP
      })
    break
  }
}
