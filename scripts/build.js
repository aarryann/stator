import { writeToPackageDotJson, getFromPackageDotJson } from './utils.js';
import fs from 'fs';
import zlib from 'zlib';
import esbuild from 'esbuild';

const packages = ['statorjs', 'statorgen'];

packages.forEach(pkg => {
  const distPath = `./packages/${pkg}/dist`;
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, 0o744);
  }

  const buildFiles = fs.readdirSync(`./packages/${pkg}/builds`);
  buildFiles.forEach(file => bundleFile(pkg, file));
});

function bundleFile(pkg, file) {
  const bundlers = {
    'cdn.js': () => {
      /*
      build({
        entryPoints: [`packages/${pkg}/builds/${file}`],
        outfile: `packages/${pkg}/dist/${file}`,
        bundle: true,
        platform: 'browser',
        define: { CDN: 'true' }
      });
      */
      build({
        entryPoints: [`packages/${pkg}/builds/${file}`],
        outfile: `packages/${pkg}/dist/${file.replace('.js', '.min.js')}`,
        bundle: true,
        minify: true,
        treeShaking: true,
        pure: ['console.log', 'debug'],
        platform: 'browser',
        define: {
          CDN: 'true',
          'process.env.NODE_ENV': '"production"',
          DEBUG: 'false'
        }
      }).then(() => {
        outputSize(pkg, `packages/${pkg}/dist/${file.replace('.js', '.min.js')}`);
      });
    },
    'module.js': () => {
      build({
        entryPoints: [`packages/${pkg}/builds/${file}`],
        outfile: `packages/${pkg}/dist/${file.replace('.js', '.esm.min.js')}`,
        bundle: true,
        minify: true,
        platform: 'neutral',
        mainFields: ['module', 'main']
      });

      build({
        entryPoints: [`packages/${pkg}/builds/${file}`],
        outfile: `packages/${pkg}/dist/${file.replace('.js', '.cjs.min.js')}`,
        bundle: true,
        minify: true,
        target: ['node10.4'],
        platform: 'node'
      }).then(() => {
        writeToPackageDotJson(pkg, 'main', `dist/${file.replace('.js', '.cjs.js')}`);
        writeToPackageDotJson(pkg, 'module', `dist/${file.replace('.js', '.esm.js')}`);
      });
    }
  };

  bundlers[file]();
}

function build(options) {
  options.define ||= {};
  options.define['STATOR_VERSION'] = `'${getFromPackageDotJson('statorjs', 'version')}'`; /// STATOR CUSTOMIZED

  const isWatchMode = process.argv.includes('--watch');

  if (isWatchMode) {
    return esbuild
      .build({
        logLevel: 'info',
        define: {
          'process.env.NODE_ENV': `'production'`
        },
        // external: ['statorjs'],
        ...options
      })
      .then(async context => {
        await context.watch();
        console.log('Watching for changes...');
      })
      .catch(() => process.exit(1));
  } else {
    return esbuild
      .build({
        logLevel: 'warning',
        define: {
          'process.env.NODE_ENV': `'development'`
        },
        // external: ['statorjs'],
        ...options
      })
      .catch(() => process.exit(1));
  }
}

function outputSize(pkg, file) {
  let size = bytesToSize(zlib.brotliCompressSync(fs.readFileSync(file)).length);

  console.log('\x1b[32m', `${pkg}: ${size}`);
}

function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return 'n/a';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
}
