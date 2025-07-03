#!/usr/bin/env node

import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

try {
  // Sync version across all files before publishing
  console.log('Syncing version across all files...');
  execSync('node scripts/sync-version.js', { stdio: 'inherit', cwd: rootDir });
  
  // Get command line arguments
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  
  // Run prepublishOnly script
  if (!isDryRun) {
    console.log('Running prepublishOnly checks...');
    execSync('npm run prepublishOnly', { stdio: 'inherit', cwd: rootDir });
  }
  
  // Run npm publish with all passed arguments
  const publishCommand = `npm publish --access public ${args.join(' ')}`;
  console.log(`Running: ${publishCommand}`);
  
  execSync(publishCommand, { stdio: 'inherit', cwd: rootDir });
  
  console.log(isDryRun ? '\nDry run completed successfully!' : '\nPublished successfully!');
  
  if (!isDryRun) {
    console.log('\nNext steps:');
    console.log('1. Create a GitHub release with the same version tag');
    console.log('2. Update the changelog if you have one');
    console.log('3. Announce the release to users');
  }
} catch (error) {
  console.error('Publish failed:', error.message);
  process.exitCode = 1;
}