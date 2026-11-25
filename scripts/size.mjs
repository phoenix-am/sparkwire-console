#!/usr/bin/env node
/** The app's shipped JavaScript and CSS, gzipped, against size-budget.json. Run after `npm run build`. */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const dist = path.resolve('dist/assets');
const budget = JSON.parse(fs.readFileSync(path.resolve('scripts/size-budget.json'), 'utf8'));
const total = (ext) => fs.readdirSync(dist).filter((f) => f.endsWith(ext)).reduce((n, f) => n + zlib.gzipSync(fs.readFileSync(path.join(dist, f)), { level: 9 }).length, 0);
const sizes = { js: total('.js'), css: total('.css') };
const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
let over = false;
for (const [k, v] of Object.entries(sizes)) {
  const limit = budget[k];
  const bad = v > limit;
  over ||= bad;
  console.log(`${bad ? '✖' : '✓'} ${k.padEnd(4)} ${kb(v).padStart(9)} of ${kb(limit)}`);
}
if (process.argv.includes('--write')) {
  fs.writeFileSync(path.resolve('scripts/size-budget.json'), JSON.stringify({ js: Math.ceil((sizes.js * 1.1) / 1000) * 1000, css: Math.ceil((sizes.css * 1.1) / 1000) * 1000 }, null, 2) + '\n');
  console.log('Wrote scripts/size-budget.json');
} else if (over) process.exit(1);
