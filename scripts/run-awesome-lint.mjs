#!/usr/bin/env node
// Runs awesome-lint against README.md for .github/workflows/awesome-lint.yml.
//
// The awesome-lint CLI only exposes a --reporter flag, no way to disable an
// individual rule (see https://github.com/sindresorhus/awesome-lint, cli.js).
// So this calls its lint() API directly, gets the vfiles back, and drops
// messages from a small set of rules that are genuinely wrong for this list
// (documented per-rule below) before deciding pass/fail and printing.
// Every other rule still runs on every entry and still fails the build.
//
// Requires `awesome-lint` to be resolvable as a module, which the workflow
// arranges with `npm install --no-save awesome-lint` before this runs (there
// is no committed package.json, matching the rest of scripts/).

import process from 'node:process';
import lint from 'awesome-lint';

// remark-lint:awesome-list-item flags every single entry in this list as an
// "Invalid list item link", because it expects `- [Name](url) - Description.`
// with the link as the paragraph's first child. This repo's own entry format
// (`- **[Name](url)** - Description.`, enforced by check-list-format.mjs and
// documented in CONTRIBUTING.md) wraps the link in **bold** for scannability,
// which puts a `strong` node there instead. Bold names are a deliberate,
// repo-wide style choice, not a mistake, so this rule can never pass here.
//
// remark-lint:double-link flags every URL used more than once anywhere in
// the document, including badges, the quick-nav line, and section anchors
// referenced from more than one place. Those repeats are intentional
// navigation aids, not accidental duplication (this list already has its own
// audit-duplicate-urls.mjs for the kind of accidental cross-section URL
// reuse worth a second look).
//
// remark-lint:awesome-license flags the presence of a "## License" heading
// at all. This list keeps one on purpose, to explain that the MIT license
// covers the curation (README, CONTRIBUTING.md) and not the third-party
// tools/channels/books it links to, a clarification worth keeping.
const DISABLED_RULES = new Set(['awesome-list-item', 'double-link', 'awesome-license']);

async function main() {
  const [vfile] = await lint({ filename: 'README.md' });
  vfile.messages = vfile.messages.filter((message) => !DISABLED_RULES.has(message.ruleId));

  for (const message of vfile.messages) {
    const location = message.line ? `${message.line}:${message.column}` : '?';
    console.log(`${vfile.basename}:${location} ${message.reason} (${message.source}:${message.ruleId})`);
  }

  const hasErrors = vfile.messages.some((message) => message.fatal !== false);
  if (hasErrors) {
    console.error(`\n${vfile.messages.length} issue(s) found.`);
    process.exitCode = 1;
  } else {
    console.log(`\nawesome-lint passed (${DISABLED_RULES.size} rule(s) disabled, see comments in this script).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
