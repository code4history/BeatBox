#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Get bump type from arguments
const bumpType = process.argv[2] || 'patch'; // major, minor, patch
if (!['major', 'minor', 'patch'].includes(bumpType)) {
  console.error('Invalid bump type. Use: major, minor, or patch');
  process.exit(1);
}

// Read package.json
const packageJsonPath = path.join(rootDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

// Calculate new version
const [major, minor, patch] = currentVersion.split('.').map(Number);
let newVersion;
switch (bumpType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

console.log(`Bumping version from ${currentVersion} to ${newVersion}`);

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

// Run sync-version to update other files
console.log('Syncing version across all files...');
execSync('node scripts/sync-version.js', { stdio: 'inherit', cwd: rootDir });

// Create git commit
console.log('Creating git commit...');
execSync(`git add -A && git commit -m "chore: bump version to ${newVersion}"`, { 
  stdio: 'inherit', 
  cwd: rootDir 
});

// Create git tag
console.log('Creating git tag...');
execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`, { 
  stdio: 'inherit', 
  cwd: rootDir 
});

console.log(`\nVersion bumped to ${newVersion}`);
console.log('To publish this release:');
console.log('  1. Push commits: git push');
console.log('  2. Push tags: git push --tags');
console.log('  3. The release workflow will automatically publish to npm');