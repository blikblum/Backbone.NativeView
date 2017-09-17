'use strict';

const fs = require('fs');
const del = require('del');
const rollup = require('rollup');
const ignore = require('rollup-plugin-ignore');
const pkg = require('../package.json');

let promise = Promise.resolve();

// Clean up the output directory
promise = promise.then(() => del(['dist/*']));

// Compile source code into a distributable format with Babel
['es', 'umd'].forEach((format) => {
  promise = promise.then(() => rollup.rollup({
    input: 'index.js',
    external: Object.keys(pkg.peerDependencies || {}),
    plugins: [ignore(['jquery'])]
}).then(bundle => bundle.write({
  file: `dist/marionette.native${format === 'umd' ? '' : '.esm'}.js`,
  format,
  sourcemap: true,
  name: format === 'umd' ? 'Marionette.Native' : undefined,
  globals: {
    backbone: 'Backbone'
  }
})));
});

// Copy package.json and LICENSE.txt
promise = promise.then(() => {
delete pkg.private;
delete pkg.devDependencies;
delete pkg.scripts;
delete pkg.babel;
fs.writeFileSync('dist/package.json', JSON.stringify(pkg, null, '  '), 'utf-8');
fs.writeFileSync('dist/README.md', fs.readFileSync('README.md', 'utf-8'), 'utf-8');
});

promise.catch(err => console.error(err.stack)); // eslint-disable-line no-console
