#!/usr/bin/env node
// Builds the quarterly resource-verification checklist
// (.github/workflows/verification-check.yml). A working link isn't the same
// as a still-useful resource: a tool can go from free to paid, a channel can
// stop publishing, a course can be retired but left online, all without the
// URL ever breaking. This surfaces every entry that hasn't been verified
// (link works, resource is still maintained, pricing is still accurate) in
// the last six months, so that work doesn't depend on someone remembering.
//
// Verification dates live in data/last-verified.json, a flat
// { "https://url": "YYYY-MM-DD" } map, kept separate from the generated
// data/resources.json so recording a verification never requires touching
// README.md. Update it by hand (or via a future script) after checking an
// entry; there's no automation that verifies content today.
//
// Usage:
//   node scripts/check-verification-age.mjs
//
// The parsing and selection live in pure exports so they can be unit-tested.

import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const STALE_AFTER_DAYS = 182; // roughly six months

// Pure: given the resource list and the last-verified map, return every
// entry that's either never been verified or was verified more than
// `staleDays` before `now`. Sorted by section, then name, for a stable report.
export function findStale(resources, lastVerified, now, staleDays = STALE_AFTER_DAYS) {
  const cutoff = new Date(now).getTime() - staleDays * 24 * 60 * 60 * 1000;
  const stale = [];

  for (const r of resources) {
    const verifiedOn = lastVerified[r.url];
    if (verifiedOn && new Date(verifiedOn).getTime() >= cutoff) continue;
    stale.push({ ...r, lastVerified: verifiedOn ?? null });
  }

  return stale.sort((a, b) => {
    const bySection = (a.section ?? '').localeCompare(b.section ?? '');
    return bySection !== 0 ? bySection : a.name.localeCompare(b.name);
  });
}

// Pure: render the stale list as a Markdown issue body.
export function buildReport(stale, totalCount, now, staleDays = STALE_AFTER_DAYS) {
  const today = new Date(now).toISOString().slice(0, 10);
  const lines = [];

  lines.push(
    `As of ${today}: ${stale.length} of ${totalCount} entries have not been ` +
      `verified in the last ${Math.round(staleDays / 30.44)} months (or have never been verified).`
  );
  lines.push('');
  lines.push('**Verifying an entry means confirming, by actually opening the link:**');
  lines.push('');
  lines.push('- the link still works');
  lines.push('- the resource is still maintained (not abandoned, not a dead project)');
  lines.push('- the pricing tag — `(free)`, `(freemium)`, or `(paid)` — is still accurate');
  lines.push('');
  lines.push(
    'After checking an entry, record it in `data/last-verified.json` (a flat ' +
      '`{ "url": "YYYY-MM-DD" }` map) with a PR. Fix anything you find wrong in the same PR ' +
      "(update the pricing tag, fix the URL, or remove the entry per CONTRIBUTING.md's " +
      'removal guidance).'
  );
  lines.push('');

  if (stale.length === 0) {
    lines.push('Nothing is currently stale. Nice.');
    return lines.join('\n');
  }

  let section = null;
  for (const e of stale) {
    if (e.section !== section) {
      if (section !== null) lines.push('');
      section = e.section;
      lines.push(`### ${section ?? 'Uncategorized'}`);
      lines.push('');
    }
    const when = e.lastVerified ? `last verified ${e.lastVerified}` : 'never verified';
    lines.push(`- [ ] [${e.name}](${e.url}) — _${when}_`);
  }

  return lines.join('\n');
}

// --- CLI (runs only when this file is executed directly, not when imported) ---
function invokedDirectly() {
  return process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
}

if (invokedDirectly()) {
  const RESOURCES_PATH = new URL('../data/resources.json', import.meta.url);
  const LAST_VERIFIED_PATH = new URL('../data/last-verified.json', import.meta.url);

  const resources = JSON.parse(readFileSync(RESOURCES_PATH, 'utf8'));
  const lastVerified = JSON.parse(readFileSync(LAST_VERIFIED_PATH, 'utf8'));

  const now = new Date();
  const stale = findStale(resources, lastVerified, now);

  console.log(buildReport(stale, resources.length, now));
}
