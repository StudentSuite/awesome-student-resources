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
- [ ] Free, freemium, or clearly worth the price, with the pricing noted.
- [ ] A reputable tool, channel, or book, not spam or an affiliate funnel.
- [ ] Short, plain-language description.

---

## Entry format

```md
- **[Name](https://homepage)** - Short description of what it does.
```

For books and textbooks, use the title (add the author where it helps) and link to the official or publisher page:

```md
- **[Deep Work](https://calnewport.com/books/deep-work/)** - Build the ability to focus without distraction.
```

Keep the description to one line, roughly 10 words or fewer. Lead with a verb where it reads naturally, skip adjectives like "amazing" or "powerful," and note the pricing when it matters: `(free)`, `(freemium)`, `(paid)`, or "free, open source" for FOSS. No em dashes.

"When it matters" means: tag it if a student could reasonably be surprised (a freemium tool that reads as free, a paid service, a free tier with real limits). You don't need to tag something whose free-ness is already obvious from the description itself (an official government site, an open-source project, a nonprofit's own guide).

---

## Where it goes

Add your single bullet to the closest matching section:

- Exam & Curriculum Prep (A-Level, ACT, AP, AP Computer Science, CBSE, Extended Essay, GCSE, IB, ICSE, IGCSE, PSAT, SAT, Theory of Knowledge)
- By Subject (Mathematics, Statistics, Further Mathematics, Physics, Chemistry, Biology, Computer Science, Economics, Business Studies, English Language and Literature, Foreign Languages, History, Geography, Environmental Systems & Societies, Psychology, Art, Music)
- Notes & Knowledge Management
- Flashcards & Spaced Repetition
- Task, Time & Planning
- Writing, Citations & Reference
- Diagramming & STEM Tools
- Building Software / Learn to Code (Learn to Code, Coding Practice)
- Student Discounts & Free Access
- Scholarships & Financial Aid
- University & Career Prep
- FOSS Picks (fully free and open source only)
- YouTube Channels We Trust
- Blogs, Newsletters & Podcasts
- Books We Trust (study skill and mindset books)
- Great Textbooks (subject textbooks)
- Guides & How-Tos
- Mental Health & Wellbeing
- Communities

If nothing fits, open an issue first to discuss a new section before adding one.

---

## Submitting

1. Fork the repo, add your single bullet in the right section, in its correct alphabetical position.
2. Open a PR titled `Add resource: Name`.
3. In the PR description, link the resource and say in one sentence why it helps students.

One entry per PR keeps review fast. Every list is sorted alphabetically (case-insensitive) by the entry name, so place your bullet where it belongs rather than at the end.

If your PR removes an entry (dead link, discontinued service, no longer meets the Quality Standards), add a one-line note under CHANGELOG.md's `Unreleased > Removed` section saying what was removed and why.

---

## CI checks

A CI check runs `scripts/check-list-format.mjs` on every PR that touches README.md or this file. It verifies the entry format, alphabetical order, that the Table of Contents matches the section headings, that descriptions don't use marketing adjectives ("amazing," "powerful," and similar; see the `BANNED_ADJECTIVES` list in the script), and that the "Where it goes" list above stays in sync with README's section headings (same names, same order). Run it yourself before opening a PR with:

```sh
node scripts/check-list-format.mjs
```

The header badges (`resources-N`, `sections-N`) and the per-section counts in the Table of Contents are generated, not hand-maintained. After adding or removing an entry, regenerate them with:

```sh
node scripts/update-counts.mjs
```

CI runs `node scripts/update-counts.mjs --check` and fails the build if any of those numbers have drifted, so don't edit them by hand.

A separate scheduled workflow (`.github/workflows/dead-link-check.yml`) checks every link in README.md, CONTRIBUTING.md, and CODE_OF_CONDUCT.md weekly using [lychee](https://github.com/lycheeverse/lychee), configured via `lychee.toml`. Some legitimate sites reject automated requests with a 403, so that status is accepted rather than treated as broken; see the comments in `lychee.toml` for the current exceptions.

A third workflow (`.github/workflows/markdownlint.yml`) runs `markdownlint-cli2` on every Markdown file. Its config, `.markdownlint.jsonc`, turns off the rules that conflict with this repo's intentional style: long single-line entries (MD013) and the `<details>`/`<picture>` inline HTML used for collapsible sections and the logo (MD033, scoped to just those elements).

The lint workflow also runs `scripts/audit-duplicate-urls.mjs`, which reports every URL used more than once anywhere in README.md. This is informational only and never fails the build: the same resource legitimately appears in more than one section (e.g. Physics & Maths Tutor under both A-Level and IGCSE), so a duplicate URL isn't a bug on its own, just something worth a glance during review.

A `.github/workflows/welcome.yml` workflow (via `actions/first-interaction`) leaves a short comment on a contributor's first issue and first PR, pointing them to this file and the Quality Standards. It's a one-time greeting, not a gate; it never blocks anything.
