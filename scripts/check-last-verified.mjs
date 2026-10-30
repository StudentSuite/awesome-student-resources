#!/usr/bin/env node
// Validates data/last-verified.json, the { "url": "YYYY-MM-DD" } map that drives the
// quarterly verification issue (scripts/check-verification-age.mjs). That script looks a
// URL up by exact string, so a stale key silently resets an entry's date and a malformed
// value is read as "never verified". This catches both before they reach main.
//
// Errors (exit 1):
//   - a key that matches no URL in data/resources.json (an orphan, usually left behind
//     when an entry's URL changed)
//   - a value that is not a real YYYY-MM-DD calendar date
//   - a date in the future
// Warnings (printed, exit 0):
//   - an entry in data/resources.json with no date at all
//
// Usage:
//   node scripts/check-last-verified.mjs
//
// `validateLastVerified()` is pure so it can be unit-tested against inline fixtures.

import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Pure: true for a real calendar date written as YYYY-MM-DD (rejects 2026-02-30 and the like).
export function isValidDate(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

// Pure: returns { errors, warnings } as arrays of strings.
export function validateLastVerified(resources, lastVerified, now = new Date()) {
  const errors = [];
  const warnings = [];
  const today = new Date(now).toISOString().slice(0, 10);
  const knownUrls = new Set(resources.map((r) => r.url));

  for (const [url, date] of Object.entries(lastVerified)) {
    if (!knownUrls.has(url)) {
      errors.push(`Orphan key: ${url} matches no URL in data/resources.json.`);
    }
    if (!isValidDate(date)) {
      errors.push(`Malformed date for ${url}: ${JSON.stringify(date)} (expected YYYY-MM-DD).`);
    } else if (date > today) {
      errors.push(`Future date for ${url}: ${date} is after today (${today}).`);
    }
  }

  for (const r of resources) {
    if (!(r.url in lastVerified)) {
      warnings.push(`No verification date for "${r.name}" (${r.url}).`);
    }
  }

  return { errors, warnings };
}

// --- CLI (runs only when this file is executed directly, not when imported) ---
function invokedDirectly() {
  return process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
}

if (invokedDirectly()) {
  const resources = JSON.parse(readFileSync(new URL('../data/resources.json', import.meta.url), 'utf8'));
  const lastVerified = JSON.parse(readFileSync(new URL('../data/last-verified.json', import.meta.url), 'utf8'));
  const { errors, warnings } = validateLastVerified(resources, lastVerified);

  if (warnings.length) {
    console.warn(`⚠ ${warnings.length} entr${warnings.length === 1 ? 'y has' : 'ies have'} no verification date:\n`);
    for (const w of warnings) console.warn(`  ${w}`);
    console.warn('');
  }

  if (errors.length) {
    console.error(`✖ ${errors.length} problem(s) in data/last-verified.json:\n`);
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }

  console.log('✔ data/last-verified.json keys and dates are valid.');
}
