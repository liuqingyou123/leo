const chalk = require('chalk')

exports.PROJECT_CONFIG = './config/index.js'

exports.BUILD_TYPES  = {
  WEAPP: 'weapp',
  H5: 'h5'
}

const processTypeEnum = {
  START: 'start',
  CREATE: 'create',
  COMPILE: 'compile',
  CONVERT: 'convert',
  COPY: 'copy',
  GENERATE: 'generate',
  MODIFY: 'modify',
  ERROR: 'error',
  WARNING: 'warning',
  UNLINK: 'unlink',
  REFERENCE: 'reference'
}

exports.processTypeEnum = processTypeEnum

exports.processTypeMap = {
  [processTypeEnum.CREATE]: {
    name: '创建',
    color: 'cyan'
  },
  [processTypeEnum.COMPILE]: {
    name: '编译',
    color: 'green'
  },
  [processTypeEnum.CONVERT]: {
    name: '转换',
    color: chalk.rgb(255, 136, 0)
  },
  [processTypeEnum.COPY]: {
    name: '拷贝',
    color: 'magenta'
  },
  [processTypeEnum.GENERATE]: {
    name: '生成',
    color: 'blue'
  },
  [processTypeEnum.MODIFY]: {
    name: '修改',
    color: 'yellow'
  },
  [processTypeEnum.ERROR]: {
    name: '错误',
    color: 'red'
  },
  [processTypeEnum.WARNING]: {
    name: '警告',
    color: 'yellowBright'
  },
  [processTypeEnum.UNLINK]: {
    name: '删除',
    color: 'magenta'
  },
  [processTypeEnum.START]: {
    name: '启动',
    color: 'green'
  },
  [processTypeEnum.REFERENCE]: {
    name: '引用',
    color: 'blue'
  }
}
