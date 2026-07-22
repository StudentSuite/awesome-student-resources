import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseEntries, selectBatch, buildChecklist } from './pricing-review.mjs';

const README = `# Title

## Exam Prep

### SAT

- **[Alpha](https://alpha.example)** - x (free).
- **[Beta](https://beta.example)** - y (freemium).

## By Subject

- **[Gamma](https://gamma.example)** - z (paid).
- **[Delta](https://delta.example)** - untagged entry with pricing in prose.
`;

test('parseEntries extracts name, url, tag, and nearest heading', () => {
  const entries = parseEntries(README);
  assert.equal(entries.length, 4);
  assert.deepEqual(
    entries.map((e) => [e.name, e.tag, e.section]),
    [
      ['Alpha', 'free', 'SAT'],
      ['Beta', 'freemium', 'SAT'],
      ['Gamma', 'paid', 'By Subject'],
      ['Delta', null, 'By Subject'],
    ]
  );
});

test('parseEntries records 1-based line numbers', () => {
  const entries = parseEntries(README);
  assert.equal(entries[0].name, 'Alpha');
  assert.equal(README.split('\n')[entries[0].line - 1], '- **[Alpha](https://alpha.example)** - x (free).');
});

test('selectBatch is deterministic for the same index', () => {
  const entries = parseEntries(README);
  assert.deepEqual(selectBatch(entries, 3, 2), selectBatch(entries, 3, 2));
});

test('selectBatch returns batchSize items and rotates by index', () => {
  const entries = parseEntries(README);
  const b0 = selectBatch(entries, 0, 2).map((e) => e.name);
  const b1 = selectBatch(entries, 1, 2).map((e) => e.name);
  assert.deepEqual(b0, ['Alpha', 'Beta']);
  assert.deepEqual(b1, ['Gamma', 'Delta']);
});

test('selectBatch wraps around past the end of the list', () => {
  const entries = parseEntries(README); // 4 entries
  const b2 = selectBatch(entries, 2, 3).map((e) => e.name);
  // start = (2 * 3) % 4 = 2 -> indexes 2,3,0
  assert.deepEqual(b2, ['Gamma', 'Delta', 'Alpha']);
});

test('consecutive batches cover every entry within one cycle', () => {
  const entries = parseEntries(README); // 4 entries, size 2 -> 2 batches per cycle
  const seen = new Set();
  for (let i = 0; i < Math.ceil(entries.length / 2); i++) {
    for (const e of selectBatch(entries, i, 2)) seen.add(e.name);
  }
  assert.deepEqual([...seen].sort(), ['Alpha', 'Beta', 'Delta', 'Gamma']);
});

test('selectBatch handles an empty list', () => {
  assert.deepEqual(selectBatch([], 0, 5), []);
});

test('selectBatch caps size at the number of entries', () => {
  const entries = parseEntries(README);
  assert.equal(selectBatch(entries, 0, 999).length, entries.length);
});

test('buildChecklist renders checkboxes, tags, and the untagged fallback', () => {
  const entries = parseEntries(README);
  const md = buildChecklist(entries, 0, 2);
  assert.match(md, /- \[ \] \[Alpha\]\(https:\/\/alpha\.example\) — `\(free\)` — _SAT_/);
  assert.match(md, /- \[ \] \[Beta\]\(https:\/\/beta\.example\) — `\(freemium\)`/);
  // A batch of 2 renders exactly 2 checklist items.
  assert.equal((md.match(/^- \[ \]/gm) || []).length, 2);
});

test('buildChecklist notes the untagged case for entries with no pricing tag', () => {
  const entries = parseEntries(README);
  const md = buildChecklist(entries, 1, 2); // Gamma + Delta; Delta is untagged
  assert.match(md, /\[Delta\].*_no explicit tag_/);
});
