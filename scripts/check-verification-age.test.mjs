import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findStale, buildReport, STALE_AFTER_DAYS } from './check-verification-age.mjs';

const NOW = new Date('2026-09-01T00:00:00Z');

const RESOURCES = [
  { name: 'Beta', url: 'https://beta.example', section: 'Guides & How-Tos', pricing: 'free' },
  { name: 'Alpha', url: 'https://alpha.example', section: 'Guides & How-Tos', pricing: 'free' },
  { name: 'Gamma', url: 'https://gamma.example', section: 'Books We Trust', pricing: 'paid' },
];

test('findStale flags entries with no verification record', () => {
  const stale = findStale(RESOURCES, {}, NOW);
  assert.equal(stale.length, 3);
  assert.deepEqual(
    stale.map((e) => e.lastVerified),
    [null, null, null]
  );
});

test('findStale excludes entries verified within the window', () => {
  const lastVerified = { 'https://alpha.example': '2026-08-15' };
  const stale = findStale(RESOURCES, lastVerified, NOW);
  assert.equal(stale.some((e) => e.name === 'Alpha'), false);
  assert.equal(stale.length, 2);
});

test('findStale includes entries verified before the cutoff', () => {
  const lastVerified = { 'https://alpha.example': '2025-01-01' };
  const stale = findStale(RESOURCES, lastVerified, NOW);
  assert.equal(stale.some((e) => e.name === 'Alpha'), true);
});

test('findStale respects a custom staleDays window', () => {
  const lastVerified = { 'https://alpha.example': '2026-08-01' };
  // Verified a month ago: stale at the default ~6 months, not stale at 10 days.
  assert.equal(
    findStale(RESOURCES, lastVerified, NOW).some((e) => e.name === 'Alpha'),
    false
  );
  assert.equal(
    findStale(RESOURCES, lastVerified, NOW, 10).some((e) => e.name === 'Alpha'),
    true
  );
});

test('findStale sorts by section then name', () => {
  const stale = findStale(RESOURCES, {}, NOW);
  assert.deepEqual(
    stale.map((e) => [e.section, e.name]),
    [
      ['Books We Trust', 'Gamma'],
      ['Guides & How-Tos', 'Alpha'],
      ['Guides & How-Tos', 'Beta'],
    ]
  );
});

test('findStale handles an empty resource list', () => {
  assert.deepEqual(findStale([], {}, NOW), []);
});

test('STALE_AFTER_DAYS is roughly six months', () => {
  assert.ok(STALE_AFTER_DAYS >= 180 && STALE_AFTER_DAYS <= 186);
});

test('buildReport reports a clean state when nothing is stale', () => {
  const report = buildReport([], 3, NOW);
  assert.match(report, /0 of 3 entries/);
  assert.match(report, /Nothing is currently stale/);
});

test('buildReport groups entries under section headings', () => {
  const stale = findStale(RESOURCES, {}, NOW);
  const report = buildReport(stale, RESOURCES.length, NOW);
  assert.match(report, /### Books We Trust/);
  assert.match(report, /### Guides & How-Tos/);
  assert.match(report, /- \[ \] \[Gamma\]\(https:\/\/gamma\.example\) — _never verified_/);
});

test('buildReport shows the last-verified date when known', () => {
  const stale = findStale(RESOURCES, { 'https://alpha.example': '2025-01-01' }, NOW);
  const report = buildReport(stale.filter((e) => e.name === 'Alpha'), RESOURCES.length, NOW);
  assert.match(report, /- \[ \] \[Alpha\]\(https:\/\/alpha\.example\) — _last verified 2025-01-01_/);
});
