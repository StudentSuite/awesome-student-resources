# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project doesn't follow strict semantic versioning (it's a curated list, not
software), but releases are still tagged so changes are easy to point to.

## [Unreleased]

### Added

- `SECURITY.md` scoped to a curated list, and an `.editorconfig`, matching the
  sibling awesome-skills-plugins-for-students list so both repos ship the same
  OSS file set.
- `MD024` (`siblings_only`) in the markdownlint config, so changelog entries
  that repeat "Added"/"Changed" headings across versions lint clean.

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

[Unreleased]: https://github.com/StudentSuite/awesome-student-resources/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/StudentSuite/awesome-student-resources/releases/tag/v1.0.0
