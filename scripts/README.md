# scripts/

Tooling that keeps README.md and CONTRIBUTING.md consistent, plus two scheduled
maintenance helpers. Everything here is dependency-free Node (run with plain
`node`, no `npm install` needed) and exports its core logic as pure functions
so behavior can be unit-tested against inline fixtures instead of the real
README.

## check-list-format.mjs

Validates README.md against the rules in CONTRIBUTING.md:

- every entry matches `- **[Name](url)** - Description.`
- entries within each list are sorted alphabetically (case-insensitive), no
  duplicate URLs within the same list
- every section heading has a matching Table of Contents entry, and vice versa
- no marketing adjectives in descriptions (see `BANNED_ADJECTIVES` in the script)
- CONTRIBUTING.md's "Where it goes" list stays in sync with README's section
  headings (same names, same order)

```sh
node scripts/check-list-format.mjs
```

Exits 1 and prints every issue found; exits 0 with a confirmation line when
everything checks out.

**Runs in:** `.github/workflows/lint.yml`, on PRs touching README.md,
CONTRIBUTING.md, or this script, and on pushes to `main`.

## update-counts.mjs

Regenerates every derived count in README.md from the actual content: the
`resources-N` header badge, the `sections-N` header badge, and each
per-section count in the Table of Contents.

```sh
node scripts/update-counts.mjs           # rewrites README.md in place
node scripts/update-counts.mjs --check   # exits 1 if anything is out of date; writes nothing
```

Run the plain version after adding or removing an entry so the badges and
Table of Contents don't drift. `--check` is what CI runs — it never writes,
only verifies.

**Runs in:** `.github/workflows/lint.yml`, same triggers as above (via
`--check`).

## audit-duplicate-urls.mjs

Reports every URL used more than once anywhere in README.md, regardless of
section. This is a maintainer-facing audit, not a lint check: cross-section
duplicates are often intentional (the same resource can legitimately serve
two sections), so this always exits 0 and never fails CI.

```sh
node scripts/audit-duplicate-urls.mjs
```

**Runs in:** `.github/workflows/lint.yml`, same triggers as above; always
runs, never fails the job.

## export-json.mjs

Parses README.md into `data/resources.json`: one record per resource entry
(`name`, `url`, `description`, `pricing`, `section`, `subsection`), skipping
front-matter/footer sections like More from StudentSuite. Gives tools other
than a human reading the page something to consume.

```sh
node scripts/export-json.mjs           # writes data/resources.json
node scripts/export-json.mjs --check   # exits 1 if data/resources.json is out of date; writes nothing
```

Run the plain version after adding or removing an entry, same as
`update-counts.mjs`.

**Runs in:** `.github/workflows/lint.yml`, on changes to README.md,
scripts/export-json.mjs, or data/resources.json (via `--check`).

## pricing-review.mjs

Builds a rotating spot-check batch for the monthly pricing re-review. Pricing
claims can't be verified automatically the way dead links can (a tool that
quietly starts charging still returns HTTP 200), so this surfaces a fresh
slice of entries for a maintainer to eyeball each month, cycling through the
full list over time instead of never revisiting anything.

```sh
node scripts/pricing-review.mjs            # print this month's batch
node scripts/pricing-review.mjs --batch N  # print a specific batch number (for testing/preview)
```

`BATCH_SIZE` (currently 15) controls how many entries appear per batch.

**Runs in:** `.github/workflows/pricing-review.yml`, on a monthly cron (1st of
the month), which opens an issue from the script's output.

## Tests

Every script above exports its core logic as pure functions (`checkListFormat`,
`applyCounts`, `findDuplicateUrls`, `parseResources`/`buildResourcesData`,
`parseEntries`/`selectBatch`/`buildChecklist`) so it can be tested against
inline fixtures.

```sh
node --test scripts/*.test.mjs
```

**Runs in:** `.github/workflows/test.yml`, whenever anything under `scripts/`
(or the workflow file itself) changes.
