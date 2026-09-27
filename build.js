#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Simple build script that copies files from source to dist
const sourceDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

function copyDirectory(sourcePath, destinationPath, displayPath) {
  if (!fs.existsSync(sourcePath)) {
    return;
  }

  fs.mkdirSync(destinationPath, { recursive: true });

  const entries = fs.readdirSync(sourcePath, { withFileTypes: true });
  entries.forEach((entry) => {
    const entrySourcePath = path.join(sourcePath, entry.name);
    const entryDestinationPath = path.join(destinationPath, entry.name);
    const entryDisplayPath = `${displayPath}/${entry.name}`;

    if (entry.isDirectory()) {
      copyDirectory(entrySourcePath, entryDestinationPath, entryDisplayPath);
      return;
    }

    fs.copyFileSync(entrySourcePath, entryDestinationPath);
    console.log(`  ✓ Copied ${entryDisplayPath}`);
  });
}

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy files
const filesToCopy = ['index.html', 'main.js', 'animations.js', 'symbols.mjs', 'style.css', 'siren.mp3'];

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

// Copy .well-known directory
copyDirectory(path.join(sourceDir, '.well-known'), path.join(distDir, '.well-known'), '.well-known');
copyDirectory(path.join(sourceDir, 'assets'), path.join(distDir, 'assets'), 'assets');

console.log('Build complete! Files are in the dist/ directory.');
