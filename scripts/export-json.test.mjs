import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseResources, buildResourcesData } from './export-json.mjs';

test('parses name, url, description, and pricing tag', () => {
  const readme = `## Alpha

- **[Apple](https://a.example)** - Does apple things (free).
`;
  const resources = parseResources(readme);
  assert.deepEqual(resources, [
    {
      name: 'Apple',
      url: 'https://a.example',
      description: 'Does apple things',
      pricing: 'free',
      section: 'Alpha',
      subsection: null,
    },
  ]);
});

test('handles an entry with no pricing tag', () => {
  const readme = `## Alpha

- **[Apple](https://a.example)** - Does apple things.
`;
  const resources = parseResources(readme);
  assert.equal(resources[0].pricing, null);
  assert.equal(resources[0].description, 'Does apple things');
});

test('tracks the nearest ### subsection, reset by the next ##', () => {
  const readme = `## Alpha

### Fruit

- **[Apple](https://a.example)** - x (free).

## Beta

- **[Banana](https://b.example)** - y (free).
`;
  const resources = parseResources(readme);
  assert.equal(resources[0].section, 'Alpha');
  assert.equal(resources[0].subsection, 'Fruit');
  assert.equal(resources[1].section, 'Beta');
  assert.equal(resources[1].subsection, null);
});

test('ignores bullets before any heading', () => {
  const readme = `- **[Orphan](https://o.example)** - x (free).

## Alpha

- **[Apple](https://a.example)** - y (free).
`;
  const resources = parseResources(readme);
  assert.equal(resources.length, 1);
  assert.equal(resources[0].name, 'Apple');
});

test('buildResourcesData filters out non-content sections like More from StudentSuite', () => {
  const readme = `## Alpha

- **[Apple](https://a.example)** - x (free).

## More from StudentSuite

- **[Sibling List](https://sibling.example)** - y (free).
`;
  const resources = buildResourcesData(readme);
  assert.equal(resources.length, 1);
  assert.equal(resources[0].name, 'Apple');
});
