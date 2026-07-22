import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyCounts } from './update-counts.mjs';

// Minimal README with both badges and a TOC table. Correct counts: total 3,
// sections (TOC rows) 2, Alpha 2, Beta 1.
const VALID = `# Title

![Resources](https://img.shields.io/badge/resources-3-blue)
![Sections](https://img.shields.io/badge/sections-2-purple)

## Table of Contents

| | Section | Resources |
| :-: | --- | :-: |
| 1 | [Alpha](#alpha) | 2 |
| 2 | [Beta](#beta) | 1 |

## Alpha

- **[Apple](https://apple.example)** - x (free).
- **[Banana](https://banana.example)** - y (free).

## Beta

- **[Cherry](https://cherry.example)** - z (free).
`;

test('correct counts produce no problems and no changes', () => {
  const { updated, problems } = applyCounts(VALID);
  assert.deepEqual(problems, []);
  assert.equal(updated, VALID);
});

test('wrong resources badge is detected and corrected', () => {
  const input = VALID.replace('resources-3-blue', 'resources-99-blue');
  const { updated, problems } = applyCounts(input);
  assert.ok(problems.some((p) => /Resources badge says 99, should be 3/.test(p)));
  assert.ok(updated.includes('resources-3-blue'));
});

test('wrong sections badge is detected and corrected', () => {
  const input = VALID.replace('sections-2-purple', 'sections-9-purple');
  const { updated, problems } = applyCounts(input);
  assert.ok(problems.some((p) => /Sections badge says 9, should be 2/.test(p)));
  assert.ok(updated.includes('sections-2-purple'));
});

test('wrong per-section TOC count is detected and corrected', () => {
  const input = VALID.replace('| [Alpha](#alpha) | 2 |', '| [Alpha](#alpha) | 42 |');
  const { updated, problems } = applyCounts(input);
  assert.ok(problems.some((p) => /"#alpha" says 42, should be 2/.test(p)));
  assert.ok(updated.includes('| [Alpha](#alpha) | 2 |'));
});

test('multiple drifted counts are all corrected in one pass', () => {
  let input = VALID.replace('resources-3-blue', 'resources-1-blue');
  input = input.replace('| [Beta](#beta) | 1 |', '| [Beta](#beta) | 7 |');
  const { updated, problems } = applyCounts(input);
  assert.equal(problems.length, 2);
  assert.equal(updated, VALID);
});

test('applyCounts is idempotent (fixing then re-checking is clean)', () => {
  const input = VALID.replace('resources-3-blue', 'resources-1-blue');
  const once = applyCounts(input).updated;
  const twice = applyCounts(once);
  assert.deepEqual(twice.problems, []);
  assert.equal(twice.updated, once);
});
