#!/usr/bin/env node
// Validates README.md against the rules in CONTRIBUTING.md:
//   - every entry matches "- **[Name](url)** - Description."
//   - entries within each list are sorted alphabetically, case-insensitive
//   - no duplicate URLs within the same list
//   - every section heading has a matching Table of Contents entry, and vice versa
//   - no marketing adjectives in descriptions (CONTRIBUTING.md: "skip adjectives
//     like 'amazing' or 'powerful'")
//   - CONTRIBUTING.md's "Where it goes" list stays in sync with README's sections

import { readFileSync } from 'node:fs';

const README_PATH = new URL('../README.md', import.meta.url);
const CONTRIBUTING_PATH = new URL('../CONTRIBUTING.md', import.meta.url);
const readme = readFileSync(README_PATH, 'utf8');
const lines = readme.split('\n');

const errors = [];

// README `##` headings that are front-matter/footer, not resource categories a
// contributor would add to. Everything else must appear in CONTRIBUTING.md's
// "Where it goes" list (and vice versa). Add here when a new meta section lands.
const NON_CONTENT_SECTIONS = new Set([
  'Table of Contents',
  'More from StudentSuite',
  'A Note on Links',
  'Quality Standards',
  'Contributing',
  'License',
]);

// Case-insensitive, whole-word/phrase. Extend this list as new marketing fluff
// slips into a description; keep it to words CONTRIBUTING.md would actually reject.
const BANNED_ADJECTIVES = [
  'amazing',
  'powerful',
  'revolutionary',
  'game-changing',
  'game changer',
  'incredible',
  'unbelievable',
  'cutting-edge',
  'cutting edge',
  'state-of-the-art',
  'world-class',
  'best-in-class',
  'next-level',
  'groundbreaking',
  'innovative',
  'unparalleled',
  'unmatched',
  'unrivaled',
  'unrivalled',
  'ultimate',
  'must-have',
  'life-changing',
  'mind-blowing',
  'top-notch',
];

function findBannedAdjective(desc) {
  const lower = desc.toLowerCase();
  for (const phrase of BANNED_ADJECTIVES) {
    const pattern = new RegExp(`\\b${phrase.replace(/[- ]/g, '[- ]')}\\b`);
    if (pattern.test(lower)) return phrase;
  }
  return null;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/ /g, '-');
}

function compareNames(a, b) {
  const al = a.toLowerCase();
  const bl = b.toLowerCase();
  return al < bl ? -1 : al > bl ? 1 : 0;
}

// --- Parse headings and resource-list blocks (the "<details>...</details>" sections) ---
const h2Headings = [];
let currentHeading = null;
let currentItems = [];
let inDetails = false;
const blocks = [];

function flushBlock() {
  if (currentItems.length) blocks.push({ heading: currentHeading, items: currentItems });
  currentItems = [];
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const h2 = line.match(/^## (.+)/);
  const h3 = line.match(/^### (.+)/);
  if (h2) {
    flushBlock();
    currentHeading = h2[1].trim();
    h2Headings.push({ text: currentHeading, line: i + 1 });
    continue;
  }
  if (h3) {
    flushBlock();
    currentHeading = h3[1].trim();
    continue;
  }
  if (line.startsWith('<details')) {
    inDetails = true;
    continue;
  }
  if (line.startsWith('</details>')) {
    inDetails = false;
    continue;
  }
  if (!inDetails) continue;

  if (line.startsWith('- ')) {
    if (!/^- \*\*\[.+?\]\(.+?\)\*\* - .+\.$/.test(line)) {
      errors.push(
        `README.md:${i + 1}  Entry doesn't match "- **[Name](url)** - Description." format\n    ${line}`
      );
      continue;
    }
    const item = line.match(/^- \*\*\[(.+?)\]\((.+?)\)\*\*\s*-\s*(.+)$/);
    currentItems.push({ name: item[1], url: item[2], desc: item[3], line: i + 1 });

    const banned = findBannedAdjective(item[3]);
    if (banned) {
      errors.push(`README.md:${i + 1}  Description uses a marketing adjective ("${banned}"): ${line}`);
    }
  }
}
flushBlock();

// --- Rule: alphabetical order + no duplicate URLs within each list ---
for (const block of blocks) {
  const names = block.items.map((it) => it.name);
  const sorted = [...names].sort(compareNames);
  if (JSON.stringify(sorted) !== JSON.stringify(names)) {
    errors.push(
      `Section "${block.heading}"  Entries are not alphabetically sorted (case-insensitive).\n` +
        `    got:  ${names.join(', ')}\n` +
        `    want: ${sorted.join(', ')}`
    );
  }

  const seenUrls = new Map();
  for (const item of block.items) {
    if (seenUrls.has(item.url)) {
      errors.push(`README.md:${item.line}  Duplicate URL within "${block.heading}": ${item.url}`);
    }
    seenUrls.set(item.url, item.line);
  }
}

// --- Rule: Table of Contents matches section headings ---
const tocStart = lines.findIndex((l) => l.trim() === '## Table of Contents');
const tocEnd = lines.findIndex((l, i) => i > tocStart && l.startsWith('## '));
const tocLines = lines.slice(tocStart + 1, tocEnd);
// The ToC can be a bullet list, a table, or a line of "·"-separated links, so scan for
// every markdown link that points at an in-page anchor rather than assuming one shape.
const tocEntries = [...tocLines.join('\n').matchAll(/\[(.+?)\]\(#(.+?)\)/g)].map((m) => ({
  text: m[1],
  slug: m[2],
}));

const realHeadings = h2Headings.filter((h) => h.text !== 'Table of Contents');

for (const heading of realHeadings) {
  const slug = slugify(heading.text);
  if (!tocEntries.some((t) => t.slug === slug)) {
    errors.push(`README.md:${heading.line}  Section "${heading.text}" is missing from the Table of Contents.`);
  }
}
for (const entry of tocEntries) {
  if (!realHeadings.some((h) => slugify(h.text) === entry.slug)) {
    errors.push(`Table of Contents entry "${entry.text}" (#${entry.slug}) doesn't match any section heading.`);
  }
}

// --- Rule: CONTRIBUTING.md's "Where it goes" list matches README's content sections ---
// The README content sections, in document order.
const readmeSections = h2Headings.map((h) => h.text).filter((t) => !NON_CONTENT_SECTIONS.has(t));

const contributing = readFileSync(CONTRIBUTING_PATH, 'utf8').split('\n');
const whereStart = contributing.findIndex((l) => /^##\s+Where it goes\s*$/.test(l));
if (whereStart === -1) {
  errors.push(`CONTRIBUTING.md is missing a "## Where it goes" section.`);
} else {
  const whereEnd = contributing.findIndex((l, i) => i > whereStart && l.startsWith('## '));
  const whereLines = contributing.slice(whereStart + 1, whereEnd === -1 ? undefined : whereEnd);
  // Bullet section names, with any trailing " (...)" note stripped off.
  const contributingSections = whereLines
    .map((l) => l.match(/^- (.+)$/))
    .filter(Boolean)
    .map((m) => m[1].replace(/\s*\([^)]*\)\s*$/, '').trim());

  const readmeSet = new Set(readmeSections);
  const contributingSet = new Set(contributingSections);

  for (const s of readmeSections) {
    if (!contributingSet.has(s)) {
      errors.push(`Section "${s}" is a README content section but is missing from CONTRIBUTING.md's "Where it goes" list.`);
    }
  }
  for (const s of contributingSections) {
    if (!readmeSet.has(s)) {
      errors.push(`"Where it goes" in CONTRIBUTING.md lists "${s}", which isn't a README content section (renamed, removed, or add it to NON_CONTENT_SECTIONS).`);
    }
  }
  // Same membership but different order: flag so the two lists read the same top to bottom.
  if (
    readmeSet.size === contributingSet.size &&
    [...readmeSet].every((s) => contributingSet.has(s)) &&
    JSON.stringify(readmeSections) !== JSON.stringify(contributingSections)
  ) {
    errors.push(
      `CONTRIBUTING.md's "Where it goes" list is in a different order than README's sections.\n` +
        `    README:       ${readmeSections.join(', ')}\n` +
        `    CONTRIBUTING: ${contributingSections.join(', ')}`
    );
  }
}

if (errors.length) {
  console.error(`✖ ${errors.length} issue(s) found:\n`);
  for (const e of errors) console.error(`  ${e}\n`);
  process.exit(1);
} else {
  console.log('✔ README.md list format, alphabetical order, and Table of Contents all check out.');
}
