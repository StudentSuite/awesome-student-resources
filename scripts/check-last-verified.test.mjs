import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidDate, validateLastVerified } from './check-last-verified.mjs';

const NOW = new Date('2026-10-29T00:00:00Z');

const RESOURCES = [
  { name: 'Alpha', url: 'https://alpha.example' },
  { name: 'Beta', url: 'https://beta.example' },
];

test('accepts a map where every key matches a resource and every date is valid', () => {
  const { errors, warnings } = validateLastVerified(
    RESOURCES,
    { 'https://alpha.example': '2026-10-01', 'https://beta.example': '2026-10-29' },
    NOW
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
});

test('flags an orphan key that matches no resource URL', () => {
  const { errors } = validateLastVerified(
    RESOURCES,
    { 'https://alpha.example': '2026-10-01', 'https://beta.example': '2026-10-01', 'https://old.example': '2026-10-01' },
    NOW
  );
  assert.equal(errors.length, 1);
  assert.match(errors[0], /Orphan key: https:\/\/old\.example/);
});

test('flags a malformed date', () => {
  for (const bad of ['10/01/2026', '2026-1-1', 'yesterday', '2026-02-30', '2026-13-01', '', 20261001, null]) {
    const { errors } = validateLastVerified(
      RESOURCES,
      { 'https://alpha.example': bad, 'https://beta.example': '2026-10-01' },
      NOW
    );
    assert.equal(errors.length, 1, `expected one error for ${JSON.stringify(bad)}`);
    assert.match(errors[0], /Malformed date for https:\/\/alpha\.example/);
  }
});

test('flags a date in the future', () => {
  const { errors } = validateLastVerified(
    RESOURCES,
    { 'https://alpha.example': '2026-10-30', 'https://beta.example': '2026-10-01' },
    NOW
  );
  assert.equal(errors.length, 1);
  assert.match(errors[0], /Future date for https:\/\/alpha\.example/);
});

test("today's date is not in the future", () => {
  const { errors } = validateLastVerified(
    RESOURCES,
    { 'https://alpha.example': '2026-10-29', 'https://beta.example': '2026-10-29' },
    NOW
  );
  assert.deepEqual(errors, []);
});

test('reports an undated resource as a warning, not an error', () => {
  const { errors, warnings } = validateLastVerified(RESOURCES, { 'https://alpha.example': '2026-10-01' }, NOW);
  assert.deepEqual(errors, []);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /No verification date for "Beta"/);
});

test('isValidDate accepts real calendar dates only', () => {
  assert.equal(isValidDate('2026-02-28'), true);
  assert.equal(isValidDate('2028-02-29'), true);
  assert.equal(isValidDate('2026-02-29'), false);
});
