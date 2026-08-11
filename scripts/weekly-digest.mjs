#!/usr/bin/env node
// Builds the weekly digest posted to a pinned issue by
// .github/workflows/weekly-digest.yml, summarizing issues and PRs opened in
// the last 7 days so a maintainer doesn't have to open the Issues/PRs tabs
// separately to see what's new.
//
// Reads GITHUB_REPOSITORY ("owner/repo") and GITHUB_TOKEN from the
// environment, both provided automatically inside GitHub Actions.
//
// Usage:
//   node scripts/weekly-digest.mjs > digest.md

import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const WINDOW_DAYS = 7;

// Pure: split the GitHub issues-search response (which includes PRs) into
// separate issue/PR buckets, keeping only items opened within `sinceIso`.
export function splitIssuesAndPRs(items, sinceIso) {
  const since = new Date(sinceIso).getTime();
  const issues = [];
  const pulls = [];
  for (const item of items) {
    if (new Date(item.created_at).getTime() < since) continue;
    (item.pull_request ? pulls : issues).push(item);
  }
  return { issues, pulls };
}

// Pure: render the digest body from already-filtered issues/PRs.
export function renderDigest({ issues, pulls, sinceIso, repo }) {
  const since = new Date(sinceIso).toISOString().slice(0, 10);
  const line = (item) => `- [#${item.number}](${item.html_url}) ${item.title} (@${item.user.login})`;

  const issueSection = issues.length
    ? issues.map(line).join('\n')
    : '_None this week._';
  const prSection = pulls.length
    ? pulls.map(line).join('\n')
    : '_None this week._';

  return `New activity on [${repo}](https://github.com/${repo}) since ${since}.

## New issues (${issues.length})

${issueSection}

## New pull requests (${pulls.length})

${prSection}

---
Updated automatically by \`.github/workflows/weekly-digest.yml\`. This issue is reused every week rather than recreated.
`;
}

async function main() {
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  if (!repo || !token) {
    throw new Error('GITHUB_REPOSITORY and GITHUB_TOKEN must be set');
  }

  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const sinceIso = since.toISOString();

  const res = await fetch(
    `https://api.github.com/search/issues?q=repo:${repo}+created:>=${sinceIso.slice(0, 10)}&sort=created&order=asc&per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    },
  );
  if (!res.ok) {
    throw new Error(`GitHub search API returned ${res.status}: ${await res.text()}`);
  }
  const { items } = await res.json();

  const { issues, pulls } = splitIssuesAndPRs(items, sinceIso);
  process.stdout.write(renderDigest({ issues, pulls, sinceIso, repo }));
}

// Only run when executed directly, not when imported by the test file.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
