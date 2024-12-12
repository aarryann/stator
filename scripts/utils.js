import DotJson from 'dot-json';
import { exec } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function runFromPackage(pkg, command) {
  exec(command, { cwd: `${__dirname}/../packages/${pkg}` });
}

export function run(command) {
  exec(command, { cwd: `${__dirname}/..` });
}

export function writeToPackageDotJson(pkg, key, value) {
  const dotJson = new DotJson(`./packages/${pkg}/package.json`);
  dotJson.set(key, value).save();
}

export function getFromPackageDotJson(pkg, key) {
  const dotJson = new DotJson(`./packages/${pkg}/package.json`);
  return dotJson.get(key);
}

export async function ask(message, callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(message, answer => {
    if (['y', 'Y', 'yes', 'Yes', 'YES'].includes(answer)) callback();
    rl.close();
  });
}
