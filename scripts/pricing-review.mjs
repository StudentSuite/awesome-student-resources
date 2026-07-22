#!/usr/bin/env node
// Builds a rotating spot-check list for the monthly pricing re-review
// (.github/workflows/pricing-review.yml). Pricing claims can't be verified
// automatically the way dead links can, so instead of "never revisited" this
// surfaces a fresh slice of entries each month for a maintainer to eyeball.
//
// Usage:
//   node scripts/pricing-review.mjs            print this month's batch
//   node scripts/pricing-review.mjs --batch N  print a specific batch (testing)
//
// The parsing and selection live in pure exports so they can be unit-tested.

import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const BATCH_SIZE = 15;

// Pure: parse every resource entry into { name, url, tag, section, line }.
// `tag` is the trailing (free|freemium|paid) if present, else null.
// `section` is the nearest preceding heading (## or ###).
export function parseEntries(readmeText) {
  const lines = readmeText.split('\n');
  const entries = [];
  let section = null;

  for (let i = 0; i < lines.length; i++) {
    const heading = lines[i].match(/^#{2,3} (.+)/);
    if (heading) {
      section = heading[1].trim();
      continue;
    }
    const m = lines[i].match(/^- \*\*\[(.+?)\]\((.+?)\)\*\* - (.+)$/);
    if (!m) continue;
    const [, name, url, desc] = m;
    const tag = desc.match(/\((free|freemium|paid)\)\.$/)?.[1] ?? null;
    entries.push({ name, url, tag, section, line: i + 1 });
  }
  return entries;
}

// Pure, deterministic: given a batch index, return `size` entries starting at a
// rotating offset (wrapping around). Consecutive indexes tile the whole list, so
// over ceil(total / size) batches every entry is covered, then it repeats.
export function selectBatch(entries, batchIndex, batchSize = BATCH_SIZE) {
  const n = entries.length;
  if (n === 0) return [];
  const size = Math.min(batchSize, n);
  const start = (Math.abs(Math.trunc(batchIndex)) * size) % n;
  const out = [];
  for (let i = 0; i < size; i++) out.push(entries[(start + i) % n]);
  return out;
}

// Pure: render the batch as a Markdown checklist issue body.
export function buildChecklist(entries, batchIndex, batchSize = BATCH_SIZE) {
  const batch = selectBatch(entries, batchIndex, batchSize);
  const cycles = Math.ceil(entries.length / Math.min(batchSize, entries.length || 1));

  const lines = [];
  lines.push('Pricing tags can go stale without the link ever breaking, so this is a');
  lines.push('monthly spot-check of a rotating slice of the list.');
  lines.push('');
  lines.push(
    `This batch is ${batch.length} of ${entries.length} entries (the sample rotates ` +
      `each month and covers the whole list about every ${cycles} months).`
  );
  lines.push('');
  lines.push('For each entry, open the link and confirm the pricing tag still matches:');
  lines.push('');
  lines.push('- `(free)` — still free, no paywall on the useful parts');
  lines.push('- `(freemium)` — still has a genuinely usable free tier');
  lines.push('- `(paid)` — still paid');
  lines.push('');
  lines.push('Tick a box once confirmed. If one is wrong, open a PR fixing the tag (and');
  lines.push("note it under CHANGELOG.md's Unreleased if you remove the entry).");
  lines.push('');

  for (const e of batch) {
    const tag = e.tag ? `\`(${e.tag})\`` : '_no explicit tag_';
    const section = e.section ? ` — _${e.section}_` : '';
    lines.push(`- [ ] [${e.name}](${e.url}) — ${tag}${section}`);
  }

  lines.push('');
  lines.push('See the [Quality Standards](README.md#quality-standards) and the pricing');
  lines.push('guidance in [CONTRIBUTING.md](CONTRIBUTING.md).');
  return lines.join('\n');
}

// --- CLI (runs only when this file is executed directly, not when imported) ---
function invokedDirectly() {
  return process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
}

if (invokedDirectly()) {
  const README_PATH = new URL('../README.md', import.meta.url);
  const entries = parseEntries(readFileSync(README_PATH, 'utf8'));

  const batchArg = process.argv.indexOf('--batch');
  // Default rotation: one step per calendar month, so scheduled monthly runs advance.
  const now = new Date();
  const batchIndex = batchArg !== -1 ? Number(process.argv[batchArg + 1]) : now.getFullYear() * 12 + now.getMonth();

  console.log(buildChecklist(entries, batchIndex));
}
