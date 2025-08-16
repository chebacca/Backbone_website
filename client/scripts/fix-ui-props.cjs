/*
  Codemod: Remove framer-motion props from non-motion elements and fix <divdiv> typos
  - Strips: initial, animate, transition, whileHover, exit, layout (boolean or assigned)
  - Targets opening tags for: Box, div
  - Also replaces <divdiv / </divdiv> typos
*/

const fs = require('fs');
const path = require('path');

const root = path.join(process.cwd(), 'src');
const targetExtensions = new Set(['.tsx', '.jsx']);
const tagNames = ['Box', 'div'];
const attrs = ['initial', 'animate', 'transition', 'whileHover', 'exit'];

function replaceAll(source, searchValue, replaceValue) {
  return source.split(searchValue).join(replaceValue);
}

function stripAttrsFromOpeningTag(tagString) {
  let result = tagString;
  for (const attr of attrs) {
    const re = new RegExp(`\\s+${attr}\\s*=\\s*\\{\\{[\\s\\S]*?\\}\\}`, 'g');
    result = result.replace(re, '');
  }
  result = result.replace(/\s+layout(\s*=\s*\{[\s\S]*?\})?/g, '');
  result = result.replace(/\s{2,}/g, ' ');
  result = result.replace(/([^\s>])\/>/g, '$1 />');
  return result;
}

function transformFileContent(content) {
  let updated = content;
  updated = replaceAll(updated, '<divdiv', '<div');
  updated = replaceAll(updated, '</divdiv>', '</div>');

  // Remove any import ... from 'framer-motion'
  updated = updated.replace(/^\s*import[\s\S]*?from\s+['"]framer-motion['"];?\s*$/gm, '');

  // Strip AnimatePresence tags but keep the children
  updated = updated.replace(/<\/?AnimatePresence\b[^>]*>/g, '');

  // Replace <motion.X ...> with <X> and </motion.X> with </X>
  updated = updated.replace(/<motion\.(\w+)\b[^>]*>/g, (_m, tag) => `<${tag}>`);
  updated = updated.replace(/<\/motion\.(\w+)>/g, (_m, tag) => `</${tag}>`);
  for (const tag of tagNames) {
    const openTagRegex = new RegExp(`<${tag}\\b[^>]*>`, 'g');
    updated = updated.replace(openTagRegex, (match) => stripAttrsFromOpeningTag(match));
  }
  return updated;
}

function walk(dirPath, fileHandler) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, fileHandler);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (targetExtensions.has(ext)) {
        fileHandler(fullPath);
      }
    }
  }
}

const changedFiles = [];
const DRY_RUN = process.argv.includes('--dry-run');

walk(root, (filePath) => {
  const original = fs.readFileSync(filePath, 'utf8');
  const transformed = transformFileContent(original);
  if (transformed !== original) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, transformed, 'utf8');
    }
    changedFiles.push(filePath);
  }
});

if (changedFiles.length === 0) {
  console.log('No changes were necessary.');
} else {
  console.log(`${DRY_RUN ? 'Would update' : 'Updated'} ${changedFiles.length} files:`);
  for (const f of changedFiles) console.log(' -', path.relative(process.cwd(), f));
}


