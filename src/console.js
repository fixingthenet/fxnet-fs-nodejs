//http://millermedeiros.github.io/mdoc/examples/node_api/doc/repl.htm
//https://node.readthedocs.io/en/latest/api/readline/

import app from './app';

const awaitMatcher = /^(?:\s*(?:(?:let|var|const)\s)?\s*([^=]+)=\s*|^\s*)(await\s[\s\S]*)/;

const asyncWrapper = (code, binder) => {
  let assign = binder ? `global.${binder} = ` : '';
  return `(function(){ async function _wrap() { return ${assign}${code} } return _wrap();})()`;
};    

var ctx={models: app.models}
var resolver = function(code) {

  const match = code.match(awaitMatcher)  
  if (match) {
    code = `${asyncWrapper(match[2],match[1])}`;  
  }
    try {
        console.log(eval(code))
    } catch(e) {
        console.log(e)
    }
}

const fs = require('fs'),
      pjson = require('../package.json')

app.start(false).then(() => {
    console.log("ctx.models is your friend")

    var readline = require('readline');




    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
    });

    rl.setPrompt(`${pjson.name}> `);
    rl.prompt();

    rl.on('line', function(line) {
        switch(line.trim()) {
        case 'exit':
            rl.close()
            break;
        default:
            resolver(line)
            break;
        }
        rl.prompt();
    })
    rl.on('close', function() {
        console.log('Have a great day!');
        process.exit(0);
    });


})

// console.log(app)
// app.start(false).then(() => {
//  const replServer = repl.start({
//    prompt: `${pjson.name}> `
//  });

//  replServer.context.models = app.models;
//  //const servicesPath = './app/services/';
//  //fs.readdir(servicesPath, (err, files) => {
//  //   files.forEach(file => {
//  //  	replServer.context[`${file.split('.')[0]}Service`] = require(`${servicesPath}${file}`);
//  //  });
//  //});
// });
