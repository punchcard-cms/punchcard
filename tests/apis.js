import test from 'ava';
import uuid from 'uuid';
import ipsum from 'lorem-ipsum';
import Promise from 'bluebird';
import slugify from 'underscore.string/slugify';
import apiUtils from '../lib/api/utils';
import utils from '../lib/utils';
import database from '../lib/database';

const content = [];
const types = [];

for (let i = 0; i < 5; i++) {
  types.push(`Test Type ${ipsum({
    count: 1,
    units: 'word',
  })}`);
}

for (let i = 0; i < 200; i++) {
  const name = ipsum({
    count: 3,
    units: 'words',
    format: 'plain',
  });

  const sunrise = `${Math.round(Math.random() * 3 + 2016)}-${Math.round(Math.random() * 11 + 1)}-${Math.round(Math.random() * 25 + 1)}`;
  const sunset = `${Math.round(Math.random() * 3 + 2016)}-${Math.round(Math.random() * 11 + 1)}-${Math.round(Math.random() * 25 + 1)}`;

  const type = types[Math.round(Math.random() * 4)];

  const item = {
    'id': uuid.v4(),
    'language': 'en-us',
    'sunrise': utils.time.iso(sunrise, '00:00'),
    'sunrise-timezone': 'America/New_York',
    'sunset': utils.time.iso(sunset, '00:00'),
    'sunset-timezone': 'America/New_York',
    'key': name,
    'key-slug': slugify(name),
    type,
    'type-slug': slugify(type),
    'attributes': {
      name,
      text: ipsum({
        count: 3,
        units: 'paragraphs',
        format: 'html',
      }),
    },
  };

  content[i] = item;
}

test.cb.before(t => {
  Promise.map(content, item => {
    return database('live').insert(item);
  }).then(() => {
    t.end();
  }).catch(e => {
    console.error(e);
    t.fail();
  });
});


test('Format Results - List', t => {
  const formatted = apiUtils.format(content.slice(0, 9));

  formatted.forEach(item => {
    t.true(item.hasOwnProperty('id'), 'Contains ID');
    t.true(item.hasOwnProperty('type'), 'Contains Type');
    t.true(item.hasOwnProperty('type_slug'), 'Contains Type Slug');
    t.true(item.hasOwnProperty('key'), 'Contains Key');
    t.true(item.hasOwnProperty('key_slug'), 'Contains Key Slug');
    t.true(item.hasOwnProperty('meta'), 'Contains Meta');
    t.false(item.hasOwnProperty('attributes'), 'Does not contain attributes');
    t.is(item.meta.url, `/api/types/${item.type_slug}/${item.id}`, 'URL points to full content item');
  });
});

test('Format Results - Attributes', t => {
  const formatted = apiUtils.format(content.slice(0, 9), true);

  formatted.forEach(item => {
    t.true(item.hasOwnProperty('id'), 'Contains ID');
    t.true(item.hasOwnProperty('type'), 'Contains Type');
    t.true(item.hasOwnProperty('type_slug'), 'Contains Type Slug');
    t.true(item.hasOwnProperty('key'), 'Contains Key');
    t.true(item.hasOwnProperty('key_slug'), 'Contains Key Slug');
    t.false(item.hasOwnProperty('meta'), 'Does not contain Meta');
    t.true(item.hasOwnProperty('attributes'), 'Contains attributes');
  });
});

test('Organize - Default', t => {
  const actual = apiUtils.organize({});
  const expected = {
    sort: {
      by: 'key',
      dir: 'asc',
    },
    page: {
      offset: 0,
      limit: 30,
      page: 1,
    },
  };

  t.deepEqual(actual, expected, 'Returns defaults');
});

test('Organize - Custom', t => {
  const actual = apiUtils.organize({
    sort: 'type',
    sort_dir: 'desc', // eslint-disable-line camelcase
    page: 2,
    per_page: 50, // eslint-disable-line camelcase
  });

  const expected = {
    sort: {
      by: 'type',
      dir: 'desc',
    },
    page: {
      offset: 50,
      limit: 50,
      page: 2,
    },
  };

  t.deepEqual(actual, expected, 'Returns defaults');
});

test('Organize - Wrong', t => {
  const actual = apiUtils.organize({
    sort: 'foo',
    sort_dir: 'banana', // eslint-disable-line camelcase
    page: 0,
    per_page: 200, // eslint-disable-line camelcase
  });

  const expected = {
    sort: {
      by: 'key',
      dir: 'asc',
    },
    page: {
      offset: 0,
      limit: 100,
      page: 1,
    },
  };

  t.deepEqual(actual, expected, 'Returns defaults');
});


test.cb.after(t => {
  Promise.map(types, type => {
    return database('live').where('type', type).del();
  }).then(() => {
    t.end();
  });
});
