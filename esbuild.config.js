import esbuild from 'esbuild';

// Build for ESM - Modern browsers
await esbuild.build({
  entryPoints: ['./index.js'],
  outfile: './dist/stator.min.js',
  bundle: true,
  minify: true,
  format: 'esm', // Generate ESM module
  sourcemap: true,
  target: ['esnext']
});

console.log('Build completed for Stator!');
