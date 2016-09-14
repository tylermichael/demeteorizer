const Hoek = require('hoek')
const Util = require('util')

const Exec = require('./exec')

const defaults = {
  server: 'localhost',
  directory: '.demeteorized'
}

//
// Options include:
//    server - URL of the server (defaults to localhost).
//    directory - The output directory (defaults to .demeteorized).
//    architecture - Architecture build target.
//
module.exports = function (options, done) {
  var args, build

  options = Hoek.applyToDefaults(defaults, options)

  args = [
    'build',
    '--server', options.server,
    '--directory', Util.format('%s', options.directory)
  ]

  if (options.architecture) {
    args.push('--architecture')
    args.push(options.architecture)
  }

  if (options.debug) args.push('--debug')
  if (options.serverOnly) args.push('--server-only')
  args.push('--verbose')
  process.env.METEOR_PROFILE = 1;

  build = Exec.spawn('meteor', args, { cwd: options.input, stdio: 'inherit' })

  build.on('error', function (err) {
    var message = [
      'Meteor not in $PATH.',
      'Please make sure Meteor is installed properly.'
    ].join(' ')

    if (err.code === 'ENOENT') return done(new Error(message))
    done(err)
  })

  build.on('close', function (code) {
    if (code !== 0) return done(new Error('Conversion failed.'))
    done()
  })
}
