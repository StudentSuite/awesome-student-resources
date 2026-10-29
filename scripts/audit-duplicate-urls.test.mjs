import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findDuplicateUrls, findSameHostEntries, SHARED_HOSTS } from './audit-duplicate-urls.mjs';

test('no duplicates returns an empty array', () => {
  const readme = `- **[Apple](https://a.example)** - x (free).
- **[Banana](https://b.example)** - y (free).`;
  assert.deepEqual(findDuplicateUrls(readme), []);
});

test('a URL used twice is reported with both occurrences and line numbers', () => {
  const readme = `- **[Apple](https://a.example)** - x (free).
- **[Banana](https://b.example)** - y (free).
- **[Apricot](https://a.example)** - z (free).`;
  const dups = findDuplicateUrls(readme);
  assert.equal(dups.length, 1);
  assert.equal(dups[0].url, 'https://a.example');
  assert.deepEqual(dups[0].occurrences, [
    { name: 'Apple', line: 1 },
    { name: 'Apricot', line: 3 },
  ]);
});

test('trailing slashes are normalized so /x and /x/ count as the same URL', () => {
  const readme = `- **[One](https://a.example)** - x (free).
- **[Two](https://a.example/)** - y (free).`;
  const dups = findDuplicateUrls(readme);
  assert.equal(dups.length, 1);
  assert.equal(dups[0].url, 'https://a.example');
  assert.equal(dups[0].occurrences.length, 2);
});

test('groups are sorted most-repeated first', () => {
  const readme = `- **[A1](https://a.example)** - x (free).
- **[B1](https://b.example)** - x (free).
- **[A2](https://a.example)** - x (free).
- **[B2](https://b.example)** - x (free).
- **[B3](https://b.example)** - x (free).`;
  const dups = findDuplicateUrls(readme);
  assert.equal(dups.length, 2);
  assert.equal(dups[0].url, 'https://b.example'); // 3x comes before 2x
  assert.equal(dups[0].occurrences.length, 3);
  assert.equal(dups[1].url, 'https://a.example');
  assert.equal(dups[1].occurrences.length, 2);
});

test('non-entry lines (headings, prose, TOC links) are ignored', () => {
  const readme = `## Section

Some prose mentioning https://a.example twice: https://a.example.

- [TOC link](#a.example)
- **[Real](https://a.example)** - the only real entry (free).`;
  assert.deepEqual(findDuplicateUrls(readme), []);
});

test('findSameHostEntries groups distinct URLs on one host, with section and line', () => {
  const readme = `## Books

- **[Atomic Habits](https://jamesclear.com/atomic-habits)** - x (free).

## Blogs

- **[James Clear](https://www.jamesclear.com/3-2-1)** - y (free).
- **[Other](https://other.example)** - z (free).`;
  const groups = findSameHostEntries(readme);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].host, 'jamesclear.com');
  assert.deepEqual(groups[0].entries, [
    { name: 'Atomic Habits', url: 'https://jamesclear.com/atomic-habits', line: 3, section: 'Books' },
    { name: 'James Clear', url: 'https://www.jamesclear.com/3-2-1', line: 7, section: 'Blogs' },
  ]);
});

test('findSameHostEntries ignores entries that share an exact URL', () => {
  const readme = `- **[One](https://a.example/x)** - x (free).
- **[Two](https://a.example/x/)** - y (free).`;
  assert.deepEqual(findSameHostEntries(readme), []);
});

test('findSameHostEntries skips shared platform hosts', () => {
  assert.ok(SHARED_HOSTS.has('github.com'));
  const readme = `- **[Repo A](https://github.com/a/a)** - x (free).
- **[Repo B](https://github.com/b/b)** - y (free).`;
  assert.deepEqual(findSameHostEntries(readme), []);
});

test('findSameHostEntries sorts the biggest groups first', () => {
  const readme = `- **[A1](https://a.example/1)** - x (free).
- **[B1](https://b.example/1)** - x (free).
- **[A2](https://a.example/2)** - x (free).
- **[B2](https://b.example/2)** - x (free).
- **[B3](https://b.example/3)** - x (free).`;
  assert.deepEqual(
    findSameHostEntries(readme).map((g) => g.host),
    ['b.example', 'a.example']
  );
});

test('findSameHostEntries tolerates entries it cannot parse a host from', () => {
  const readme = `- **[Odd](not a url)** - x (free).
- **[Odd2](also not a url)** - y (free).`;
  assert.deepEqual(findSameHostEntries(readme), []);
});
