#!/usr/bin/env node
// Reports every URL used more than once across README.md, regardless of section.
// This is a maintainer-facing audit, not a lint check: cross-section duplicates are
// often intentional (e.g. StudyMap is listed in a content section and in More from StudentSuite), so
// this script always exits 0 and never fails CI.
//
// The `findDuplicateUrls(readmeText)` export is pure (returns the duplicate groups)
// so it can be unit-tested against inline fixtures; the CLI wrapper prints them.
//
// It also lists each site (host) that appears under more than one distinct URL, via
// the pure `findSameHostEntries(readmeText)`, because those pairs share no exact URL.

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

// Hosts that legitimately carry many unrelated entries, so sharing one says nothing about
// whether two entries come from the same site.
export const SHARED_HOSTS = new Set([
  'github.com',
  'youtube.com',
  'youtu.be',
  'linkedin.com',
  'reddit.com',
  'facebook.com',
  'instagram.com',
  'x.com',
  'twitter.com',
  'medium.com',
  'substack.com',
  'discord.gg',
  'discord.com',
  'notion.so',
  'google.com',
  'docs.google.com',
]);

function hostOf(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

// Pure: returns [{ host, entries: [{ name, url, line, section }] }] for hosts that appear
// under more than one distinct URL, most-repeated first. Entries that share an exact URL are
// findDuplicateUrls' business and do not count as distinct here, and SHARED_HOSTS are skipped.
// `section` is the `##` heading the entry sits under (null before the first one).
export function findSameHostEntries(readmeText) {
  const lines = readmeText.split('\n');
  const byHost = new Map();
  let section = null;

  for (let i = 0; i < lines.length; i++) {
    const heading = lines[i].match(/^## (.+)/);
    if (heading) {
      section = heading[1].trim();
      continue;
    }
    const item = lines[i].match(/^- \*\*\[(.+?)\]\((.+?)\)\*\*/);
    if (!item) continue;
    const [, name, rawUrl] = item;
    const url = normalize(rawUrl);
    const host = hostOf(url);
    if (!host || SHARED_HOSTS.has(host)) continue;
    if (!byHost.has(host)) byHost.set(host, []);
    byHost.get(host).push({ name, url, line: i + 1, section });
  }

  return [...byHost.entries()]
    .filter(([, entries]) => new Set(entries.map((e) => e.url)).size > 1)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .map(([host, entries]) => ({ host, entries }));
}

// --- CLI (runs only when this file is executed directly, not when imported) ---
function invokedDirectly() {
  return process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
}

if (invokedDirectly()) {
  const README_PATH = new URL('../README.md', import.meta.url);
  const readme = readFileSync(README_PATH, 'utf8');
  const duplicates = findDuplicateUrls(readme);
  const sameHost = findSameHostEntries(readme);

  if (!duplicates.length) {
    console.log('No URL is used more than once in README.md.');
  } else {
    console.log(`${duplicates.length} URL(s) used more than once in README.md:\n`);
    for (const { url, occurrences } of duplicates) {
      console.log(`  ${url}  (${occurrences.length}x)`);
      for (const { name, line } of occurrences) {
        console.log(`    README.md:${line}  ${name}`);
      }
      console.log('');
    }
  }

  if (sameHost.length) {
    console.log(`${sameHost.length} host(s) listed under more than one distinct URL:\n`);
    for (const { host, entries } of sameHost) {
      console.log(`  ${host}  (${entries.length} entries)`);
      for (const { name, line, section } of entries) {
        console.log(`    README.md:${line}  ${name}  [${section ?? 'no section'}]`);
      }
      console.log('');
    }
  }

  process.exit(0);
}
