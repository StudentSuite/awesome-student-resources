#!/usr/bin/env node
// Regenerates every derived count in README.md from the actual content:
//   - the `resources-N` header badge (total entries across the whole list)
//   - the `sections-N` header badge (number of rows in the Table of Contents)
//   - each per-section count in the Table of Contents table
//
// Usage:
//   node scripts/update-counts.mjs           rewrites README.md in place
//   node scripts/update-counts.mjs --check    exits 1 if anything is out of date
//                                             (used in CI; nothing is written)
//
// Run the plain version after adding or removing an entry so the badges and the
// Table of Contents stay accurate without hand-counting.

import { readFileSync, writeFileSync } from 'node:fs';

const README_PATH = new URL('../README.md', import.meta.url);
const check = process.argv.includes('--check');

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/ /g, '-');
}

const original = readFileSync(README_PATH, 'utf8');
const lines = original.split('\n');

// --- Count entries per top-level (##) section, and the grand total ---
const sectionCounts = new Map(); // slug -> entry count
let currentSlug = null;
let total = 0;

for (const line of lines) {
  const h2 = line.match(/^## (.+)/);
  if (h2) {
    currentSlug = slugify(h2[1].trim());
    if (!sectionCounts.has(currentSlug)) sectionCounts.set(currentSlug, 0);
    continue;
  }
  if (/^- \*\*\[/.test(line)) {
    total += 1;
    if (currentSlug) sectionCounts.set(currentSlug, sectionCounts.get(currentSlug) + 1);
  }
}

// --- Rewrite pass ---
const problems = [];
let tocRowCount = 0;

const updated = lines.map((line) => {
  // Resources badge
  const resourcesBadge = line.match(/^(!\[Resources\]\(https:\/\/img\.shields\.io\/badge\/resources-)(\d+)(-[a-z]+\))$/);
  if (resourcesBadge) {
    const current = Number(resourcesBadge[2]);
    if (current !== total) {
      problems.push(`Resources badge says ${current}, should be ${total}.`);
      return `${resourcesBadge[1]}${total}${resourcesBadge[3]}`;
    }
    return line;
  }

  // Table of Contents rows: | <emoji> | [Name](#slug) | <count> |
  const tocRow = line.match(/^(\|\s*.*?\s*\|\s*\[.+?\]\(#(.+?)\)\s*\|\s*)(\d+)(\s*\|)$/);
  if (tocRow) {
    tocRowCount += 1;
    const slug = tocRow[2];
    const stated = Number(tocRow[3]);
    const actual = sectionCounts.get(slug);
    if (actual === undefined) {
      problems.push(`Table of Contents row "#${slug}" doesn't match any section heading.`);
      return line;
    }
    if (stated !== actual) {
      problems.push(`Table of Contents "#${slug}" says ${stated}, should be ${actual}.`);
      return `${tocRow[1]}${actual}${tocRow[4]}`;
    }
    return line;
  }

  return line;
});

// --- Sections badge (depends on the TOC row count computed above) ---
const finalUpdated = updated.map((line) => {
  const sectionsBadge = line.match(/^(!\[Sections\]\(https:\/\/img\.shields\.io\/badge\/sections-)(\d+)(-[a-z]+\))$/);
  if (sectionsBadge) {
    const current = Number(sectionsBadge[2]);
    if (current !== tocRowCount) {
      problems.push(`Sections badge says ${current}, should be ${tocRowCount}.`);
      return `${sectionsBadge[1]}${tocRowCount}${sectionsBadge[3]}`;
    }
  }
  return line;
});

const result = finalUpdated.join('\n');

if (check) {
  if (problems.length) {
    console.error(`✖ README.md counts are out of date (${problems.length}):\n`);
    for (const p of problems) console.error(`  ${p}`);
    console.error(`\n  Run: node scripts/update-counts.mjs`);
    process.exit(1);
  }
  console.log('✔ README.md badge and Table of Contents counts are up to date.');
} else {
  if (result !== original) {
    writeFileSync(README_PATH, result);
    console.log(`Updated README.md counts (${problems.length} change(s)):`);
    for (const p of problems) console.log(`  ${p}`);
  } else {
    console.log('README.md counts already up to date; nothing to change.');
  }
}
