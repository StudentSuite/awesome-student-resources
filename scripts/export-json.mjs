#!/usr/bin/env node
// Parses README.md into data/resources.json: one record per resource entry
// (name, url, description, pricing, section, subsection). Gives tools other
// than a human reading the page something to consume (e.g. the searchable-site
// idea in #53), and a stable shape for others to build on.
//
// Usage:
//   node scripts/export-json.mjs           writes data/resources.json
//   node scripts/export-json.mjs --check    exits 1 if data/resources.json is
//                                           out of date; writes nothing (used in CI)
//
// `parseResources` and `buildResourcesData` are pure so they can be
// unit-tested against inline fixtures; the CLI wrapper at the bottom reads
// the real README.md and writes/checks the real data/resources.json.

import { readFileSync, writeFileSync, mkdirSync, existsSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { NON_CONTENT_SECTIONS } from './check-list-format.mjs';

// Pure: parse every resource entry into
// { name, url, description, pricing, section, subsection }.
// `section` is the nearest preceding ## heading. `subsection` is the nearest
// preceding ### heading since that ## started, or null if the entry sits
// directly under the ##. `pricing` is "free" | "freemium" | "paid" | null.
export function parseResources(readmeText) {
  const lines = readmeText.split(/\r?\n/);
  const resources = [];
  let section = null;
  let subsection = null;

  for (const line of lines) {
    const h2 = line.match(/^## (.+)/);
    if (h2) {
      section = h2[1].trim();
      subsection = null;
      continue;
    }
    const h3 = line.match(/^### (.+)/);
    if (h3) {
      subsection = h3[1].trim();
      continue;
    }
    const m = line.match(/^- \*\*\[(.+?)\]\((.+?)\)\*\*\s*-\s*(.+)$/);
    if (!m || !section) continue;

    const [, name, url, rawDescription] = m;
    const tagMatch = rawDescription.match(/^(.*?)\s*\((free|freemium|paid)\)\.$/);
    const description = (tagMatch ? tagMatch[1] : rawDescription.replace(/\.$/, '')).trim();
    const pricing = tagMatch ? tagMatch[2] : null;

    resources.push({ name, url, description, pricing, section, subsection });
  }
  return resources;
}

// Pure: parseResources, minus front-matter/footer sections (Table of
// Contents, More from StudentSuite, etc.) that aren't curated resources.
export function buildResourcesData(readmeText) {
  return parseResources(readmeText).filter((r) => !NON_CONTENT_SECTIONS.has(r.section));
}

// --- CLI (runs only when this file is executed directly, not when imported) ---
function invokedDirectly() {
  return process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
}

if (invokedDirectly()) {
  const README_PATH = new URL('../README.md', import.meta.url);
  const DATA_DIR = new URL('../data/', import.meta.url);
  const OUTPUT_PATH = new URL('../data/resources.json', import.meta.url);

  const resources = buildResourcesData(readFileSync(README_PATH, 'utf8'));
  const json = `${JSON.stringify(resources, null, 2)}\n`;
  const check = process.argv.includes('--check');

  if (check) {
    const current = existsSync(OUTPUT_PATH) ? readFileSync(OUTPUT_PATH, 'utf8') : null;
    if (current !== json) {
      console.error('✖ data/resources.json is out of date. Run: node scripts/export-json.mjs');
      process.exit(1);
    }
    console.log('✔ data/resources.json matches README.md.');
  } else {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(OUTPUT_PATH, json);
    console.log(`Wrote data/resources.json (${resources.length} resources).`);
  }
}
