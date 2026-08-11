import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitIssuesAndPRs, renderDigest } from './weekly-digest.mjs';

const SINCE = '2026-08-01T00:00:00Z';

function item(overrides) {
  return {
    number: 1,
    title: 'Something',
    html_url: 'https://github.com/o/r/issues/1',
    created_at: '2026-08-02T00:00:00Z',
    user: { login: 'someone' },
    ...overrides,
  };
}

test('splitIssuesAndPRs separates PRs from issues by the pull_request field', () => {
  const items = [
    item({ number: 1 }),
    item({ number: 2, pull_request: {} }),
  ];
  const { issues, pulls } = splitIssuesAndPRs(items, SINCE);
  assert.deepEqual(issues.map((i) => i.number), [1]);
  assert.deepEqual(pulls.map((i) => i.number), [2]);
});

test('splitIssuesAndPRs drops items created before the window', () => {
  const items = [item({ number: 1, created_at: '2026-07-20T00:00:00Z' })];
  const { issues, pulls } = splitIssuesAndPRs(items, SINCE);
  assert.equal(issues.length, 0);
  assert.equal(pulls.length, 0);
});

test('renderDigest lists issues and PRs under separate headings', () => {
  const body = renderDigest({
    issues: [item({ number: 1, title: 'Bug report' })],
    pulls: [item({ number: 2, title: 'Fix bug', pull_request: {} })],
    sinceIso: SINCE,
    repo: 'o/r',
  });
  assert.match(body, /## New issues \(1\)/);
  assert.match(body, /## New pull requests \(1\)/);
  assert.match(body, /#1.*Bug report/);
  assert.match(body, /#2.*Fix bug/);
});

test('renderDigest falls back to a placeholder when a section is empty', () => {
  const body = renderDigest({ issues: [], pulls: [], sinceIso: SINCE, repo: 'o/r' });
  assert.match(body, /_None this week\._/);
});
