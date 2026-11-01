# Contributing

This repository curates links only. The tool, channel, or book you add lives wherever it already lives, we just point to it.

By participating, you're expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

Have an open-ended question rather than a resource to add, a broken link, or a new-section proposal? Ask it in [Discussions](https://github.com/StudentSuite/awesome-student-resources/discussions) instead of opening an issue.

---

## Finding an issue

If you want to contribute but aren't sure where to start, check out our open issues:

- If you're new to the project or open source, we recommend starting with issues labeled **good first issue**.
- If you have more experience, you can also look for **help wanted** issues.

---

## Before you open a PR

Check the entry meets the [Quality Standards](README.md#quality-standards):

- [ ] Genuinely useful to students for studying, building, or organizing.
- [ ] Real and maintained, not abandoned or a dead link.
- [ ] Free, freemium, or clearly worth the price, with exactly one pricing badge on the entry (plus FOSS where it applies).
- [ ] A reputable tool, channel, or book, not spam or an affiliate funnel.
- [ ] Short, plain-language description.

---

## Entry format

```md
- **[Name](https://homepage)** - Short description of what it does ![free](https://img.shields.io/badge/free-2489CA?style=flat-square).
```

For books and textbooks, use the title (add the author where it helps) and link to the official or publisher page:

```md
- **[Deep Work](https://calnewport.com/deep-work-rules-for-focused-success-in-a-distracted-world/)** - Build the ability to focus without distraction ![paid](https://img.shields.io/badge/paid-D33833?style=flat-square).
```

Keep the description to one line, roughly 10 words or fewer. Lead with a verb where it reads naturally, skip adjectives like "amazing" or "powerful," and put the tag badge(s) right before the closing period, not inside it. No em dashes.

### Tag badges

Every entry carries exactly one pricing badge, always, no exceptions for "obviously free" sites, plus the FOSS badge on top of it when the resource is also free and open source (every entry in FOSS Picks gets FOSS by definition, and CI enforces that):

| Badge | Meaning | Markdown |
| --- | --- | --- |
| ![free](https://img.shields.io/badge/free-2489CA?style=flat-square) | pricing | `![free](https://img.shields.io/badge/free-2489CA?style=flat-square)` |
| ![freemium](https://img.shields.io/badge/freemium-F5A623?style=flat-square) | pricing | `![freemium](https://img.shields.io/badge/freemium-F5A623?style=flat-square)` |
| ![paid](https://img.shields.io/badge/paid-D33833?style=flat-square) | pricing | `![paid](https://img.shields.io/badge/paid-D33833?style=flat-square)` |
| ![FOSS](https://img.shields.io/badge/FOSS-3DA639?style=flat-square) | additive, on top of a pricing badge | `![FOSS](https://img.shields.io/badge/FOSS-3DA639?style=flat-square)` |

The FOSS badge needs a licence you can point to: the source (or, for content repositories, the content) must be under an OSI-approved or Creative Commons licence that allows commercial use and derivatives. A repository with no licence file, non-commercial terms (CC BY-NC and similar) or personal-use-only terms does not qualify, so it gets its pricing badge alone. Check with `gh api repos/<owner>/<repo> --jq .license.spdx_id` and read the licence file when GitHub reports `NOASSERTION`. FOSS Picks is for fully free tools only, so a freemium or paid tool belongs in another section, with the FOSS badge on top of its pricing badge if its source is open.

Order: FOSS first, then the pricing badge, e.g. `![FOSS](...) ![free](...)`. `scripts/check-list-format.mjs` fails the build on a missing pricing badge, more than one pricing badge, an unrecognized tag name, or a FOSS Picks entry with no FOSS badge, so get this right locally before opening a PR (`node scripts/check-list-format.mjs`).

---

## Where it goes

Add your single bullet to the closest matching section:

- Student Discounts & Free Access
- Scholarships & Financial Aid
- Financial Literacy & Money Management
- University & Career Prep
- Vocational & Alternative Paths
- Debate & Public Speaking
- Homeschooling
- FOSS Picks (fully free and open source only)
- Helpful Repositories (GitHub repos, not hosted tools or apps)
- Blogs, Newsletters & Podcasts
- Books We Trust (study skill and mindset books)
- Guides & How-Tos
- Mental Health & Wellbeing
- Communities

If nothing fits, open an issue first to discuss a new section before adding one. Exam, curriculum, and subject-study resources now live in [Awesome Study Resources](https://github.com/StudentSuite/awesome-study-resources) instead.

---

## Submitting

1. Fork the repo, add your entries in the right section, in their correct alphabetical position.
2. Open a PR titled `Add resource: Name`.
3. In the PR description, link the resource and say in one sentence why it helps students.

Every list is sorted alphabetically (case-insensitive) by the entry name, so place your bullet where it belongs rather than at the end.

If your PR removes an entry (dead link, discontinued service, no longer meets the Quality Standards), add a one-line note under CHANGELOG.md's `Unreleased > Removed` section saying what was removed and why.

Single-resource addition PRs don't need their own changelog line (that would be one line per PR, most of the traffic this repo gets). Instead, a maintainer batches every merged single-resource addition into one `Unreleased > Added` entry periodically (roughly every 15-20 merged additions, or before a release, whichever comes first) rather than letting it fall multiple release cycles behind.

### Getting credited

Contributions are tracked with [all-contributors](https://allcontributors.org) in `.all-contributorsrc`, rendered as a table in README.md's Contributors section. This covers non-code contributions too, not just merged PRs: filing a well-documented bug report, reviewing someone else's PR, improving docs, or suggesting a resource all count, using the [contribution type key](https://allcontributors.org/reference/emoji-key/).

Once the [all-contributors bot](https://allcontributors.org/docs/en/bot/installation) is installed on this repo, add someone (or yourself) by commenting on an issue or PR:

```text
@all-contributors please add @their-username for content, doc
```

Use a comma-separated list of [contribution types](https://allcontributors.org/reference/emoji-key/) (`code`, `content`, `doc`, `bug`, `ideas`, `review`, `infra`, `maintenance`, and others). The bot opens a PR updating `.all-contributorsrc` and regenerating the README table; merge it like any other PR.

---

## Optional: run checks locally before you push

All scripts in `scripts/` are plain, dependency-free Node and need Node.js 24
(the current LTS release; they use the built-in `node:test` runner, which isn't
available on older versions). `.nvmrc` pins this, and CI uses the same version,
if you use `nvm`.

A committed, opt-in pre-commit hook mirrors the CI lint job. Enable it once per clone with:

```sh
git config core.hooksPath .githooks
```

After that, committing with README.md or CONTRIBUTING.md staged runs `scripts/check-list-format.mjs`, `scripts/update-counts.mjs --check`, and `scripts/export-json.mjs --check` automatically, so format, count, or generated JSON drift surfaces before you push instead of after CI fails on your PR. It's entirely optional and doesn't install anything beyond what's already in this repo; see `.githooks/pre-commit` for the script itself.

---

## CI checks

Branch protection on `main` requires the `check-list-format`, `markdownlint`, and `awesome-lint` checks to pass before a PR can merge. A red check blocks merge; there's no override, so fix what it reports rather than asking for a manual merge.

See [scripts/README.md](scripts/README.md) for a one-page reference of every script, its flags, and which workflow runs it. The rest of this section covers the same ground in prose.

Shortcuts for the commands below: `make lint`, `make test`, `make counts`, `make spellcheck` (see the `Makefile`). Dependency-free, same as everything else in `scripts/`.

A CI check runs `scripts/check-list-format.mjs` on every PR that touches README.md or this file. It verifies the entry format, alphabetical order, that the Table of Contents matches the section headings, that descriptions don't use marketing adjectives ("amazing," "powerful," and similar; see the `BANNED_ADJECTIVES` list in the script), and that the "Where it goes" list above stays in sync with README's section headings (same names, same order). Run it yourself before opening a PR with:

```sh
node scripts/check-list-format.mjs
```

The header badges (`resources-N`, `sections-N`) and the per-section counts in the Table of Contents are generated, not hand-maintained. After adding or removing an entry, regenerate them with:

```sh
node scripts/update-counts.mjs
```

CI runs `node scripts/update-counts.mjs --check` and fails the build if any of those numbers have drifted, so don't edit them by hand.

`data/resources.json` is a generated machine-readable export of the same entries (name, url, description, pricing, section, subsection), rebuilt from README.md the same way:

```sh
node scripts/export-json.mjs
```

CI runs `node scripts/export-json.mjs --check` and fails if it's drifted from README.md.

A separate scheduled workflow (`.github/workflows/dead-link-check.yml`) checks every link in README.md, CONTRIBUTING.md, and CODE_OF_CONDUCT.md weekly using [lychee](https://github.com/lycheeverse/lychee), configured via `lychee.toml`. Some legitimate sites reject automated requests with a 403, so that status is accepted rather than treated as broken; see the comments in `lychee.toml` for the current exceptions.

A third workflow (`.github/workflows/markdownlint.yml`) runs `markdownlint-cli2` on every Markdown file. Its config, `.markdownlint.jsonc`, turns off the rules that conflict with this repo's intentional style: long single-line entries (MD013) and the `<details>`/`<picture>` inline HTML used for collapsible sections and the logo (MD033, scoped to just those elements).

A fourth workflow (`.github/workflows/spellcheck.yml`) runs [codespell](https://github.com/codespell-project/codespell) over README.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md, CHANGELOG.md, SECURITY.md, CONTRIBUTORS.md, scripts/README.md, and `.github/*.md`. Tool and channel names occasionally look like typos to a spellchecker; add them to `.codespellignore` (one word per line) rather than disabling the check. Run it yourself with:

```sh
codespell README.md CONTRIBUTING.md CODE_OF_CONDUCT.md CHANGELOG.md SECURITY.md CONTRIBUTORS.md scripts/README.md .github/*.md --ignore-words=.codespellignore
```

The lint workflow also runs `scripts/audit-duplicate-urls.mjs`, which reports every URL used more than once anywhere in README.md. This is informational only and never fails the build: the same resource legitimately appears in more than one section (e.g. StudyMap in both its content section and More from StudentSuite), so a duplicate URL isn't a bug on its own, just something worth a glance during review.

The lint scripts have their own unit tests (`scripts/*.test.mjs`, using Node's built-in `node:test`), run by `.github/workflows/test.yml` whenever anything under `scripts/` changes. Run them locally with:

```sh
node --test scripts/*.test.mjs
```

A `.github/workflows/welcome.yml` workflow (via `actions/first-interaction`) leaves a short comment on a contributor's first issue and first PR, pointing them to this file and the Quality Standards. It's a one-time greeting, not a gate; it never blocks anything.

A monthly workflow (`.github/workflows/pricing-review.yml`) opens an issue with a rotating sample of entries (built by `scripts/pricing-review.mjs`) for a maintainer to spot-check that pricing tags are still accurate. A tool that quietly starts charging still returns HTTP 200, so the dead-link check won't catch it; this is the manual backstop. Preview the current sample locally with `node scripts/pricing-review.mjs`.

A weekly workflow (`.github/workflows/weekly-digest.yml`) opens or updates a single pinned issue ("Weekly digest: new issues and PRs", built by `scripts/weekly-digest.mjs`) summarizing everything opened in the last 7 days, so a maintainer has one place to check instead of the Issues and PRs tabs separately.

A daily workflow (`.github/workflows/stale.yml`, via `actions/stale`) marks an issue or PR as `stale` after 60 days without activity and closes it 14 days later if nobody comments or pushes. Reopening a closed item later is always fine. Anything carrying a label listed under `exempt-issue-labels` or `exempt-pr-labels` in that file is skipped, which is how long-running tasks stay open.

A labeling workflow (`.github/workflows/labeler.yml`, via `actions/labeler`) adds labels such as `content`, `documentation` and `infra` to every PR based on which files it changes, so you don't need to set them yourself. The path-to-label rules live in `.github/labeler.yml`.

A quarterly workflow (`.github/workflows/verification-check.yml`) opens an issue (built by `scripts/check-verification-age.mjs`) listing every entry not verified in the last six months, so that work surfaces on its own instead of depending on someone remembering. It skips creating a new issue if one from this quarter is already open. Verifying an entry means opening the link and confirming three things: the link still works, the resource is still maintained rather than abandoned, and the pricing tag is still accurate. Record a verification by adding the URL and today's date to `data/last-verified.json` (a flat `{ "url": "YYYY-MM-DD" }` map, kept separate from the generated `data/resources.json` so recording one never requires touching README.md), in the same PR that fixes anything you found wrong. Dates aren't rendered in README.md; the only value here is the maintenance prompt. Preview the current report locally with `node scripts/check-verification-age.mjs`.

A PR-gated workflow (`.github/workflows/awesome-lint.yml`) runs [awesome-lint](https://github.com/sindresorhus/awesome-lint) on every PR touching README.md, required before merge. It disables three rules that are genuinely incompatible with choices this list makes deliberately (bold entry names, intentional repeat navigation links, and keeping a License section); see the comments in `scripts/run-awesome-lint.mjs` for why. Run it yourself with:

```sh
npm install --no-save awesome-lint
node scripts/run-awesome-lint.mjs
```
