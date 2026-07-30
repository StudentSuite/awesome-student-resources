.PHONY: lint test counts spellcheck

# Everything CI's lint job runs: format/order/count checks plus the
# informational duplicate-URL audit. See scripts/README.md for details.
lint:
	node scripts/check-list-format.mjs
	node scripts/update-counts.mjs --check
	node scripts/audit-duplicate-urls.mjs

# Run the scripts/ unit tests.
test:
	node --test scripts/*.test.mjs

# Regenerate the resources-N/sections-N badges and Table of Contents
# counts after adding or removing an entry.
counts:
	node scripts/update-counts.mjs

# Same codespell check CI runs, scoped to the four docs it covers.
spellcheck:
	codespell README.md CONTRIBUTING.md CODE_OF_CONDUCT.md CHANGELOG.md --ignore-words=.codespellignore
