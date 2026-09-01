# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project doesn't follow strict semantic versioning (it's a curated list, not
software), but releases are still tagged so changes are easy to point to.

## [Unreleased]

### Added

- A new **Vocational & Alternative Paths** top-level section (apprenticeships,
  trades, bootcamps): Apprenticeship.gov, Course Report, Find an
  Apprenticeship, Mike Rowe Works Foundation.
- A **Part-Time & Student Jobs** subsection under University & Career Prep:
  Handshake, Snagajob, WayUp.
- 22 new resource entries closing #122, #123, #124, #125, #127, #130, #157,
  #158, #159, #160, #161, #162, #163, #164, #165, and #166: Cortex,
  Understood.org, Child Mind Institute, Mastercard Foundation Scholars
  Program, Scholars4Dev, English-Speaking Union, National Model United
  Nations, EU Immigration Portal, LASPAU, MoneyHelper, Transferology,
  Pestalozzi Trust, Habitica, JED Foundation, Jugend debattiert,
  International Student Insurance, The Muse, and AHEAD.
- A short paragraph after the opening description explaining why this list,
  [Awesome Study Resources](https://github.com/StudentSuite/awesome-study-resources),
  and [Awesome Skills & Plugins for Students](https://github.com/StudentSuite/awesome-skills-plugins-for-students)
  stay separate lists rather than one (#111).
- `scripts/weekly-digest.mjs` and `.github/workflows/weekly-digest.yml`: a
  weekly pinned issue summarizing issues and PRs opened in the last 7 days
  (#129).
- `scripts/run-awesome-lint.mjs` and `.github/workflows/awesome-lint.yml`:
  `awesome-lint` now runs on every PR touching README.md, required before
  merge, working toward the `sindresorhus/awesome` submission checklist
  (#103, #102).

### Fixed

- `chadd.org` excluded from the dead-link check config, the same
  bot-blocking-at-the-edge signature as the existing exclusions rather than
  a real outage (#139).
- `www.canada.ca` and `www.dewr.gov.au` excluded from the dead-link check
  config, the same bot-blocking-at-the-edge signature as the existing
  exclusions rather than a real outage (#197, #215, #220).
- Mastercard Foundation Scholars Program URL updated: the old path
  redirect-looped indefinitely (#197, #215, #220).
- EU Immigration Portal URL updated: `immigration-portal.ec.europa.eu` no
  longer resolves; now points at the equivalent page on
  `home-affairs.ec.europa.eu` (#197, #215, #220).
- The Muse cover letter guide URL updated: the old `/advice/cover-letter`
  path 404s; now points at `/advice/cover-letters` (#197, #215, #220).

### Removed

- LASPAU: the organization ceased operations on September 30, 2023 (their
  own site confirms this); the listed URL now serves an expired certificate
  for a defunct `laspau.harvard.edu` redirect (#197, #215, #220).

## [2.0.0] - 2026-07-30

### Changed

- Split the list: moved every exam, curriculum, and subject-study section
  (Exam & Curriculum Prep, By Subject, Notes & Knowledge Management,
  Flashcards & Spaced Repetition, Task/Time & Planning, Writing/Citations &
  Reference, AI & Academic Integrity, Diagramming & STEM Tools, Building
  Software / Learn to Code, YouTube Channels We Trust, and Great Textbooks)
  into the new sibling list
  [awesome-study-resources](https://github.com/StudentSuite/awesome-study-resources).
  This repo now focuses on life around school rather than the curriculum
  itself. This is the breaking change behind the major version bump: old
  in-page anchors to those sections no longer resolve here.

### Added

- A new Financial Literacy & Money Management section (budgeting, credit,
  and banking basics), including non-US entries (MoneySmart, Practical
  Money Skills) alongside the US/UK ones.
- **Applications & Resumes** and **Gap Year & Study Abroad** subsections
  under University & Career Prep, the latter expanded with non-US/EU
  programs (New Colombo Plan, Turing Scheme).
- A **Sister lists** cross-link block and an expanded **More from
  StudentSuite** section (Awesome Study Resources, StudyMap).
- Community-contributed expansion across Scholarships & Financial Aid
  (Chevening, Erasmus Mundus, International Scholarships), Homeschooling
  (GOV.UK Home Education, HSLDA Canada), FOSS Picks (Freeplane, Joplin, OBS
  Studio, Okular), Student Discounts & Free Access (Adobe Creative Cloud,
  Amazon Prime Student, Apple Education Store, Spotify Premium Student,
  UNiDAYS), Communities (Focusmate, Study Together), Guides & How-Tos
  (Cornell Note-Taking System, Pomodoro Technique, Zettelkasten.de), Books
  We Trust (Mindset), and Mental Health & Wellbeing (ADDitude, CHADD).
- New tooling: `scripts/export-json.mjs` generating `data/resources.json`
  (with a `--check` mode), a codespell spellcheck workflow, an opt-in
  pre-commit hook (`.githooks/`), a `Makefile` task runner, an
  `actions/labeler` PR auto-labeler, description-length linting in
  `check-list-format.mjs`, a `scripts/README.md` reference, and
  `.github/FUNDING.yml`.
- `CONTRIBUTORS.md`, `.github/CODEOWNERS`, a stale issue/PR bot, a
  first-time-contributor welcome bot, and GitHub Discussions as the Q&A
  venue.
- `SECURITY.md` scoped to a curated list, and an `.editorconfig`, matching
  the sibling awesome-skills-plugins-for-students list so both repos ship
  the same OSS file set.
- `MD024` (`siblings_only`) in the markdownlint config, so changelog
  entries that repeat "Added"/"Changed" headings across versions lint
  clean.

### Removed

- Chevening Scholarships (Scholarships & Financial Aid). The scheduled
  dead-link check flagged an HTTP/2 protocol error; manually confirmed (curl,
  both HTTP/1.1 and HTTP/2, plus a separate fetch from a different network)
  that the CDN edge responds but the origin never returns a response for the
  actual page, unlike the bot-detection false positives elsewhere in this
  file. Treated as a genuine outage rather than an exception to carry.
- NCERT (CBSE) and Clastify (Theory of Knowledge, Extended Essay). The
  scheduled dead-link check couldn't reliably verify these from CI (a WAF
  block and a network reset respectively, confirmed as false positives from
  a normal network), so rather than carry permanent lint exceptions for
  links our own tooling can't verify, they were removed instead.
- Underground Mathematics (Further Mathematics). The site consistently timed
  out (confirmed with repeated direct requests, up to 25s, not just from CI),
  unlike the false positives above, so this one was a genuine dead/unreachable
  link rather than an automated-traffic block.
- The CBSE and ICSE subsections (Indian national boards). Dropped to keep
  Exam & Curriculum Prep focused on the exams the rest of the list is built
  around, shortly before that section moved out entirely (see Changed above).

## [1.0.0] - 2026-07-11

### Added

- Full curated resource list across 20+ sections: Exam & Curriculum Prep (SAT,
  ACT, AP, A-Level, GCSE, IGCSE, IB), By Subject (Mathematics, Physics,
  Chemistry, Biology, Computer Science, Economics, Business Studies, English
  Language and Literature, Foreign Languages, History, Geography,
  Environmental Systems & Societies, Psychology, Art, Music), Notes &
  Knowledge Management, Flashcards & Spaced Repetition, Task, Time &
  Planning, Writing, Citations & Reference, Diagramming & STEM Tools,
  Building Software / Learn to Code (with a Coding Practice subsection),
  Student Discounts & Free Access, Scholarships & Financial Aid, University &
  Career Prep, FOSS Picks, YouTube Channels We Trust, Blogs, Newsletters &
  Podcasts, Books We Trust, Great Textbooks, Guides & How-Tos, Mental Health
  & Wellbeing, and Communities.
- `CONTRIBUTING.md` describing the entry format, quality standards, and where
  new resources go.
- `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1).
- GitHub issue templates for resource suggestions, broken links, and new
  section proposals, plus a pull request template.
- CI: `scripts/check-list-format.mjs` validates entry format, alphabetical
  order, and Table of Contents consistency on every PR.
- CI: a scheduled dead-link checker (`lychee`, weekly) that opens an issue
  when a link in README.md, CONTRIBUTING.md, or CODE_OF_CONDUCT.md breaks.
- CI: `markdownlint-cli2` with a repo-specific config that respects this
  list's intentional style (long single-line entries, collapsible sections).
- CI: a non-blocking `scripts/audit-duplicate-urls.mjs` report that surfaces
  every URL reused across sections, for reviewers to glance at.
- Dependabot configuration to keep GitHub Actions versions current.

### Changed

- Renamed the English subject section to "English Language and Literature."
- Split the original subject buckets into individual subject sections.
- Sorted every resource list alphabetically (case-insensitive), matching the
  ordering rule documented in CONTRIBUTING.md.

### Fixed

- Corrected the IB Documents link to a resolvable host.
- Updated the UWorld SAT link, which had gone stale after UWorld
  consolidated its SAT pages onto a new subdomain.

### Removed

- Removed the Focus & Distraction Blocking section.
- Removed out-of-syllabus entries from Computer Science.
- Removed the Studynova entry after confirming the site is no longer live.

[Unreleased]: https://github.com/StudentSuite/awesome-student-resources/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/StudentSuite/awesome-student-resources/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/StudentSuite/awesome-student-resources/releases/tag/v1.0.0
