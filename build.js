#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Simple build script that copies files from source to dist
const sourceDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy files
const filesToCopy = ['index.html', 'main.js', 'style.css', 'siren.mp3'];

console.log('Building project...');

filesToCopy.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const destPath = path.join(distDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`  ✓ Copied ${file}`);
  } else {
    console.log(`  ⚠ Skipped ${file} (not found)`);
  }
});

console.log('Build complete! Files are in the dist/ directory.');
