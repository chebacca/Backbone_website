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

/**
 * Replace in a string safely for all occurrences.
 */
function replaceAll(source, searchValue, replaceValue) {
  return source.split(searchValue).join(replaceValue);
}

/**
 * Remove motion-related attributes from a given opening tag string.
 * Handles multi-line attributes and double-brace values like {{ x: 0 }}.
 */
function stripAttrsFromOpeningTag(tagString) {
  let result = tagString;

  // Remove attributes like initial={{ ... }}, animate={{ ... }}, etc.
  for (const attr of attrs) {
    const re = new RegExp(`\\s+${attr}\\s*=\\s*\\{\\{[\\s\\S]*?\\}\\}`, 'g');
    result = result.replace(re, '');
  }

  // Remove layout (boolean or assigned) - conservative
  // Matches: " layout", " layout={true}", " layout={...}"
  result = result.replace(/\s+layout(\s*=\s*\{[\s\S]*?\})?/g, '');

  // Collapse excessive whitespace inside the opening tag
  result = result.replace(/\s{2,}/g, ' ');
  // Ensure a space before '/>' if self-closing and previous char isn't space or '>'
  result = result.replace(/([^\s>])\/>/g, '$1 />');

  return result;
}

/**
 * Process the content of a TSX/JSX file.
 */
function transformFileContent(content) {
  let updated = content;

  // Fix <divdiv> typos
  updated = replaceAll(updated, '<divdiv', '<div');
  updated = replaceAll(updated, '</divdiv>', '</div>');

  // For each tag name, locate opening tags and strip attributes
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

walk(root, (filePath) => {
  const original = fs.readFileSync(filePath, 'utf8');
  const transformed = transformFileContent(original);
  if (transformed !== original) {
    fs.writeFileSync(filePath, transformed, 'utf8');
    changedFiles.push(filePath);
  }
});

if (changedFiles.length === 0) {
  console.log('No changes were necessary.');
} else {
  console.log(`Updated ${changedFiles.length} files:`);
  for (const f of changedFiles) console.log(' -', path.relative(process.cwd(), f));
}


