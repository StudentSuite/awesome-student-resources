#!/usr/bin/env node
// Reports every URL used more than once across README.md, regardless of section.
// This is a maintainer-facing audit, not a lint check: cross-section duplicates are
// often intentional (e.g. Physics & Maths Tutor serves both A-Level and IGCSE), so
// this script always exits 0 and never fails CI.
//
// The `findDuplicateUrls(readmeText)` export is pure (returns the duplicate groups)
// so it can be unit-tested against inline fixtures; the CLI wrapper prints them.

import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function normalize(url) {
  return url.replace(/\/$/, '');
}

// Pure: returns [{ url, occurrences: [{ name, line }] }] for URLs seen more than
// once, most-repeated first. `line` is 1-based.
export function findDuplicateUrls(readmeText) {
  const lines = readmeText.split('\n');
  const byUrl = new Map();

  for (let i = 0; i < lines.length; i++) {
    const item = lines[i].match(/^- \*\*\[(.+?)\]\((.+?)\)\*\*/);
    if (!item) continue;
    const [, name, rawUrl] = item;
    const url = normalize(rawUrl);
    if (!byUrl.has(url)) byUrl.set(url, []);
    byUrl.get(url).push({ name, line: i + 1 });
  }

  return [...byUrl.entries()]
    .filter(([, occurrences]) => occurrences.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([url, occurrences]) => ({ url, occurrences }));
}

// --- CLI (runs only when this file is executed directly, not when imported) ---
function invokedDirectly() {
  return process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
}

if (invokedDirectly()) {
  const README_PATH = new URL('../README.md', import.meta.url);
  const duplicates = findDuplicateUrls(readFileSync(README_PATH, 'utf8'));

  if (!duplicates.length) {
    console.log('No URL is used more than once in README.md.');
    process.exit(0);
  }

  console.log(`${duplicates.length} URL(s) used more than once in README.md:\n`);
  for (const { url, occurrences } of duplicates) {
    console.log(`  ${url}  (${occurrences.length}x)`);
    for (const { name, line } of occurrences) {
      console.log(`    README.md:${line}  ${name}`);
    }
    console.log('');
  }

  process.exit(0);
}
