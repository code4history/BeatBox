#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Read package.json
const packageJsonPath = path.join(rootDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

console.log(`Syncing version ${version} across all files...`);

// Files to update
const filesToUpdate = [
  {
    path: path.join(rootDir, 'README.md'),
    type: 'markdown',
    patterns: [
      // Update version in installation instructions
      { 
        regex: /npm install @c4h\/beatbox@[\d.]+/g, 
        replacement: `npm install @c4h/beatbox@${version}` 
      },
      // Update version in CDN URLs
      { 
        regex: /@c4h\/beatbox@[\d.]+\/dist/g, 
        replacement: `@c4h/beatbox@${version}/dist` 
      }
    ]
  },
  {
    path: path.join(rootDir, 'README.ja.md'),
    type: 'markdown',
    patterns: [
      { 
        regex: /npm install @c4h\/beatbox@[\d.]+/g, 
        replacement: `npm install @c4h/beatbox@${version}` 
      },
      { 
        regex: /@c4h\/beatbox@[\d.]+\/dist/g, 
        replacement: `@c4h/beatbox@${version}/dist` 
      }
    ]
  }
];

// Update files
filesToUpdate.forEach(({ path: filePath, type, patterns }) => {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  patterns.forEach(({ regex, replacement }) => {
    const newContent = content.replace(regex, replacement);
    if (newContent !== content) {
      content = newContent;
      updated = true;
    }
  });

  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
});

console.log('Version sync completed!');