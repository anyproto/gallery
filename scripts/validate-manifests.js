#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const experiencesDir = path.join(root, 'experiences');

let errors = [];

if (!fs.existsSync(experiencesDir) || !fs.statSync(experiencesDir).isDirectory()) {
  console.error('No experiences directory found at', experiencesDir);
  process.exit(1);
}

const entries = fs.readdirSync(experiencesDir, { withFileTypes: true }).filter(d => d.isDirectory());

entries.forEach(dirent => {
  const dir = path.join(experiencesDir, dirent.name);
  const manifestPath = path.join(dir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    errors.push(`${dirent.name}: missing manifest.json`);
    return;
  }
  try {
    const content = fs.readFileSync(manifestPath, 'utf8');
    JSON.parse(content);
  } catch (e) {
    errors.push(`${dirent.name}: invalid JSON in manifest.json — ${e.message}`);
  }
  const screenshotsDir = path.join(dir, 'screenshots');
  if (!fs.existsSync(screenshotsDir) || !fs.statSync(screenshotsDir).isDirectory()) {
    errors.push(`${dirent.name}: missing screenshots/ directory`);
  } else {
    const imgs = fs.readdirSync(screenshotsDir).filter(f => !f.startsWith('.'));
    if (imgs.length === 0) {
      errors.push(`${dirent.name}: screenshots/ is empty`);
    }
  }
});

if (errors.length) {
  console.error('Validation failed:');
  errors.forEach(e => console.error(' -', e));
  process.exit(1);
} else {
  console.log('All experience manifests and screenshots look good!');
  process.exit(0);
}
