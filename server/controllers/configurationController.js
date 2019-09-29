const configuration = require('../configuration.json');

exports.configurationVariables = {};

// Set initial values
for(let key in configuration){
  exports.configurationVariables[key] = configuration[key];
}

// Set arguments
var args = process.argv.slice(2);

for(let a of args){
  let argumentList = a.split('=');
  if(exports.configurationVariables[argumentList[0]]){
    exports.configurationVariables[argumentList[0]] = argumentList[1];
  }else{
    console.log(`[ERROR]: ${argumentList[0]} is not a valid flag`);
  }
}
