#!/usr/bin/env node
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

// Simple build script that copies files from source to dist
const sourceDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

// Create dist directory if it doesn't exist
if (!fsSync.existsSync(distDir)) {
  fsSync.mkdirSync(distDir, { recursive: true });
}

// Copy files
const filesToCopy = ['index.html', 'main.js', 'style.css', 'siren.mp3'];

console.log('Building project...');

// Use async operations and Promise.all for parallel copying
async function shouldCopyFile(sourcePath, destPath) {
  try {
    const [sourceStat, destStat] = await Promise.all([
      fs.stat(sourcePath),
      fs.stat(destPath)
    ]);
    
    // Skip copy if destination is newer or same age as source
    return destStat.mtime < sourceStat.mtime;
  } catch (err) {
    // If destination doesn't exist (ENOENT) or any stat error, proceed with copy
    return true;
  }
}

async function build() {
  const copyPromises = filesToCopy.map(async file => {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(distDir, file);
    
    try {
      // Check if source file exists
      await fs.access(sourcePath);
      
      // Check if we need to copy the file
      const needsCopy = await shouldCopyFile(sourcePath, destPath);
      
      if (!needsCopy) {
        console.log(`  ⏭ Skipped ${file} (up to date)`);
        return;
      }
      
      // Copy the file
      await fs.copyFile(sourcePath, destPath);
      console.log(`  ✓ Copied ${file}`);
    } catch (err) {
      console.log(`  ⚠ Skipped ${file} (not found)`);
    }
  });
  
  await Promise.all(copyPromises);
  console.log('Build complete! Files are in the dist/ directory.');
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
