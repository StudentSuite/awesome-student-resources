import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkListFormat,
  slugify,
  compareNames,
  findBannedAdjective,
} from './check-list-format.mjs';

// A minimal, fully-valid README + CONTRIBUTING pair. Each negative test starts
// from these and introduces exactly one defect via string replacement.
const VALID_README = `# Title

## Table of Contents

- [Alpha](#alpha)
- [Beta](#beta)

## Alpha

<details open>
<summary>Show resources</summary>

- **[Apple](https://apple.example)** - A fruit tool (free).
- **[Banana](https://banana.example)** - Another fruit tool (free).

</details>

## Beta

<details open>
<summary>Show resources</summary>

- **[Cherry](https://cherry.example)** - A small red fruit (free).

</details>
`;

const VALID_CONTRIBUTING = `# Contributing

## Where it goes

- Alpha
- Beta

## Submitting

Go.
`;

function errorsFor(readme = VALID_README, contributing = VALID_CONTRIBUTING) {
  return checkListFormat(readme, contributing);
}

test('valid fixture produces no errors', () => {
  assert.deepEqual(errorsFor(), []);
});

test('malformed entry (no trailing period) is flagged', () => {
  const readme = VALID_README.replace(
    '- **[Apple](https://apple.example)** - A fruit tool (free).',
    '- **[Apple](https://apple.example)** - A fruit tool (free)'
  );
  const errors = errorsFor(readme);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /doesn't match .*format/);
});

test('malformed entry (plain link, no bold) is flagged', () => {
  const readme = VALID_README.replace(
    '- **[Apple](https://apple.example)** - A fruit tool (free).',
    '- [Apple](https://apple.example) - A fruit tool (free).'
  );
  const errors = errorsFor(readme);
  assert.ok(errors.some((e) => /doesn't match .*format/.test(e)));
});

test('out-of-order entries are flagged', () => {
  const readme = VALID_README.replace(
    `- **[Apple](https://apple.example)** - A fruit tool (free).
- **[Banana](https://banana.example)** - Another fruit tool (free).`,
    `- **[Banana](https://banana.example)** - Another fruit tool (free).
- **[Apple](https://apple.example)** - A fruit tool (free).`
  );
  const errors = errorsFor(readme);
  assert.ok(errors.some((e) => /not alphabetically sorted/.test(e)));
});

test('alphabetical order is case-insensitive', () => {
  // "apple" (lowercase) before "Banana" must still pass.
  const readme = VALID_README.replace(
    '- **[Apple](https://apple.example)** - A fruit tool (free).',
    '- **[apple](https://apple.example)** - A fruit tool (free).'
  );
  assert.deepEqual(errorsFor(readme), []);
});

test('duplicate URL within a section is flagged', () => {
  const readme = VALID_README.replace(
    '- **[Banana](https://banana.example)** - Another fruit tool (free).',
    '- **[Banana](https://apple.example)** - Another fruit tool (free).'
  );
  const errors = errorsFor(readme);
  assert.ok(errors.some((e) => /Duplicate URL/.test(e)));
});

test('same URL across different sections is allowed', () => {
  // Cherry (in Beta) reuses Apple's URL (in Alpha) — cross-section reuse is fine.
  const readme = VALID_README.replace(
    '- **[Cherry](https://cherry.example)** - A small red fruit (free).',
    '- **[Cherry](https://apple.example)** - A small red fruit (free).'
  );
  assert.deepEqual(errorsFor(readme), []);
});

test('heading missing from the Table of Contents is flagged', () => {
  const readme = VALID_README.replace('- [Beta](#beta)\n', '');
  const errors = errorsFor(readme);
  assert.ok(errors.some((e) => /missing from the Table of Contents/.test(e)));
});

test('Table of Contents entry with no matching heading is flagged', () => {
  const readme = VALID_README.replace('- [Beta](#beta)', '- [Beta](#beta)\n- [Ghost](#ghost)');
  const errors = errorsFor(readme);
  assert.ok(errors.some((e) => /doesn't match any section heading/.test(e)));
});

test('marketing adjective in a description is flagged', () => {
  const readme = VALID_README.replace(
    '- **[Apple](https://apple.example)** - A fruit tool (free).',
    '- **[Apple](https://apple.example)** - An amazing fruit tool (free).'
  );
  const errors = errorsFor(readme);
  assert.ok(errors.some((e) => /marketing adjective.*amazing/.test(e)));
});

test('CONTRIBUTING missing a README section is flagged', () => {
  const contributing = VALID_CONTRIBUTING.replace('- Beta\n', '');
  const errors = errorsFor(VALID_README, contributing);
  assert.ok(errors.some((e) => /"Beta".*missing from CONTRIBUTING/.test(e)));
});

test('CONTRIBUTING listing a non-existent section is flagged', () => {
  const contributing = VALID_CONTRIBUTING.replace('- Beta', '- Beta\n- Gamma');
  const errors = errorsFor(VALID_README, contributing);
  assert.ok(errors.some((e) => /"Gamma".*isn't a README content section/.test(e)));
});

test('CONTRIBUTING in a different order than README is flagged', () => {
  const contributing = VALID_CONTRIBUTING.replace('- Alpha\n- Beta', '- Beta\n- Alpha');
  const errors = errorsFor(VALID_README, contributing);
  assert.ok(errors.some((e) => /different order/.test(e)));
});

test('trailing " (...)" notes in CONTRIBUTING bullets are ignored when matching', () => {
  const contributing = VALID_CONTRIBUTING.replace('- Alpha', '- Alpha (Apples, Bananas)');
  assert.deepEqual(errorsFor(VALID_README, contributing), []);
});

// --- Exported helpers ---

test('slugify matches GitHub anchor rules', () => {
  assert.equal(slugify('Exam & Curriculum Prep'), 'exam--curriculum-prep');
  assert.equal(slugify('Notes & Knowledge Management'), 'notes--knowledge-management');
  assert.equal(slugify('Building Software / Learn to Code'), 'building-software--learn-to-code');
});

test('compareNames is case-insensitive', () => {
  assert.ok(compareNames('apple', 'Banana') < 0);
  assert.ok(compareNames('Banana', 'apple') > 0);
  assert.equal(compareNames('Apple', 'apple'), 0);
});

test('findBannedAdjective matches hyphen and space variants, respects word boundaries', () => {
  assert.equal(findBannedAdjective('a powerful tool'), 'powerful');
  assert.equal(findBannedAdjective('a game-changing tool'), 'game-changing');
  assert.equal(findBannedAdjective('a game changing tool'), 'game-changing');
  assert.equal(findBannedAdjective('reliable power tools listed here'), null);
  assert.equal(findBannedAdjective('clear, plain description'), null);
});
