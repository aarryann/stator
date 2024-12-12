let DotJson = require('dot-json');
let { exec } = require('child_process');

module.exports.runFromPackage = function (pkg, command) {
  exec(command, { cwd: __dirname + '/../packages/' + pkg });
};

module.exports.run = function (command) {
  exec(command, { cwd: __dirname + '/..' });
};

module.exports.writeToPackageDotJson = function (pkg, key, value) {
  let dotJson = new DotJson(`./packages/${pkg}/package.json`);

  dotJson.set(key, value).save();
};

module.exports.getFromPackageDotJson = function (pkg, key) {
  let dotJson = new DotJson(`./packages/${pkg}/package.json`);

  return dotJson.get(key);
};

module.exports.ask = async function (message, callback) {
  let readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question(message, answer => {
    if (['y', 'Y', 'yes', 'Yes', 'YES'].includes(answer)) callback();

    readline.close();
  });
};
