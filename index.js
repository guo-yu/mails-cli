import fs from 'fs'
import path from 'path'
import exeq from 'exeq'
import optimist from 'optimist'
import serve from './serve'

const argv = optimist.argv
const commands = {
  init: (self, pkg, dir) => {
    var commands = [
      'git clone https://github.com/turingou/mails-scaffold.git .',
      'rm -rf .git',
      'npm install'
    ]

    exeq(commands)
      .on('done', done)
      .run()

    function done(count) {
      console.log('another mail theme created, enjoy!')
    }
  },
  watch: (self, pkg, dir) => {
    if (!pkg) 
      return console.log('configs required')

    pkg = pkg.toString()

    fs.readFile(path.resolve(dir, pkg), watch)

    function watch(err, file) {
      if (err) 
        return console.log('404', 'configs not found');

      try {
        var data = JSON.parse(file);
        if (!data['view engine']) 
          return console.log('view engine required');

        try {
          var engine = require(data['view engine']);
          var port = argv.p && !isNaN(parseInt(argv.p, 10)) ? parseInt(argv.p, 10) : 3001;

          self.server = serve(dir, {
            port: port,
            engine: engine,
            data: data,
            pkg: path.resolve(dir, pkg)
          });
          
          return console.log('Mails is watching: http://localhost:' + port);
        } catch (err) {
          console.log('view engine required');
          console.log(err);
          return false;
        }
      } catch (err) {
        return console.log('configs format must be json');
      }
    }
  }
}

export default function() {
  var arguments = argv._
  var command = arguments[0]

  if (!command)
    return false
  if (!commands[command])
    return false

  return commands[command](this, arguments[1], process.cwd())
}
