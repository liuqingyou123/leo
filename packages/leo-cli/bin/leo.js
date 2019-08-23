const program = require('commander')

program
  .version('0.0.1')
  .usage('<command> [options]') 
  .command('build', 'Build a project with options')
  .parse(process.argv)

