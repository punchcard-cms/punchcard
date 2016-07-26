import test from 'ava';
import uuid from 'uuid';
import ipsum from 'lorem-ipsum';
import Promise from 'bluebird';
import slugify from 'underscore.string/slugify';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import apiUtils from '../lib/api/utils';
import api from '../lib/api';
import utils from '../lib/utils';
import database from '../lib/database';

const content = [];
const types = [];
const eachOfType = {};
const allTypes = [];

for (let i = 0; i < 5; i++) {
  types.push(`Test Type ${ipsum({
    count: 1,
    units: 'words',
  })}`);
  eachOfType[types[i]] = 0;
  allTypes.push({
    name: types[i],
    id: slugify(types[i]),
    description: ipsum({
      count: Math.round(Math.random() * 6 + 1),
      units: 'words',
    }),
    attributes: [],
  });
}

for (let i = 0; i < 50; i++) {
  const name = ipsum({
    count: 3,
    units: 'words',
    format: 'plain',
  });

  const sunrise = `${Math.round(Math.random() * 3 + 2016)}-${Math.round(Math.random() * 11 + 1)}-${Math.round(Math.random() * 25 + 1)}`;
  const sunset = `${Math.round(Math.random() * 3 + 2016)}-${Math.round(Math.random() * 11 + 1)}-${Math.round(Math.random() * 25 + 1)}`;

  const type = types[Math.round(Math.random() * 4)];

  eachOfType[type] += 1;

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
    t.end();
  });
});

//////////////////////////////
// Utils
//////////////////////////////
test('Utils: Format Results - List', t => {
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

test('Utils: Format Results - Attributes', t => {
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

test('Utils: Organize - Default', t => {
  const actual = apiUtils.organize();
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

test('Utils: Organize - Lookup', t => {
  const actual = apiUtils.organize({}, [
    'foo',
    'bar',
    'baz',
  ]);
  const expected = {
    sort: {
      by: 'foo',
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

test('Utils: Organize - Bad Lookup', t => {
  const actual = apiUtils.organize({}, {});
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

test('Utils: Organize - Custom', t => {
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

test('Utils: Organize - Wrong', t => {
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

test('Utils: Organize - Wrong Pages', t => {
  const actual = apiUtils.organize({
    page: -1,
    per_page: -1, // eslint-disable-line camelcase
  });

  const expected = {
    sort: {
      by: 'key',
      dir: 'asc',
    },
    page: {
      offset: 0,
      limit: 1,
      page: 1,
    },
  };

  t.deepEqual(actual, expected, 'Returns defaults');
});

test('Utils: Page - First', t => {
  const organized = apiUtils.organize();
  const actual = apiUtils.page('api', organized, 100);

  const expected = {
    first: '/api?sort=key&sort_dir=asc&per_page=30&page=1',
    prev: false,
    next: '/api?sort=key&sort_dir=asc&per_page=30&page=2',
    last: '/api?sort=key&sort_dir=asc&per_page=30&page=4',
  };


  t.deepEqual(actual, expected);
});

test('Utils: Page - Middle', t => {
  const organized = apiUtils.organize({
    page: 2,
  });
  const actual = apiUtils.page('api', organized, 100);

  const expected = {
    first: '/api?sort=key&sort_dir=asc&per_page=30&page=1',
    prev: '/api?sort=key&sort_dir=asc&per_page=30&page=1',
    next: '/api?sort=key&sort_dir=asc&per_page=30&page=3',
    last: '/api?sort=key&sort_dir=asc&per_page=30&page=4',
  };


  t.deepEqual(actual, expected);
});

test('Utils: Page - End', t => {
  const organized = apiUtils.organize({
    page: 4,
  });
  const actual = apiUtils.page('api', organized, 100);

  const expected = {
    first: '/api?sort=key&sort_dir=asc&per_page=30&page=1',
    prev: '/api?sort=key&sort_dir=asc&per_page=30&page=3',
    next: false,
    last: '/api?sort=key&sort_dir=asc&per_page=30&page=4',
  };


  t.deepEqual(actual, expected);
});

test('Utils: Page - One', t => {
  const organized = apiUtils.organize({
    page: 1,
  });
  const actual = apiUtils.page('api', organized, 30);

  const expected = {
    first: false,
    prev: false,
    next: false,
    last: false,
  };


  t.deepEqual(actual, expected);
});

test('Utils: Page - None', t => {
  const organized = apiUtils.organize({
    page: 4,
  });
  const actual = apiUtils.page('api', organized, 0);

  const expected = {
    first: false,
    prev: false,
    next: false,
    last: false,
  };


  t.deepEqual(actual, expected);
});

//////////////////////////////
// APIs
//////////////////////////////
test('APIs: Types', t => {
  const app = {
    get: word => {
      console.log(word); // eslint-disable-line no-console

      return allTypes;
    },
  };

  const keys = [
    'name',
    'description',
    'id',
  ];

  const expectedAll = cloneDeep(allTypes).map(ct => {
    const finalCT = ct;
    delete finalCT.attributes;

    finalCT.meta = {
      url: `/api/types/${ct.id}`,
      count: eachOfType[ct.name],
    };

    return finalCT;
  });

  return api.types(app).then(apiTypes => {
    console.log(apiTypes.all);  // eslint-disable-line no-console
    console.log('-----');  // eslint-disable-line no-console
    console.log(expectedAll);  // eslint-disable-line no-console
    t.true(apiTypes.hasOwnProperty('keys'), 'Has keys');
    t.true(apiTypes.hasOwnProperty('all'), 'Has All Content Types');
    t.true(isEqual(apiTypes.keys, keys), 'Keys are as expected');

    // t.true(isEqual(apiTypes.keys, expectedAll), 'All types are as expected');
    // t.deepEqual(apiTypes.keys, keys, 'Keys are as expected');
    // t.deepEqual(apiTypes.all, expectedAll, 'All types are as expected');
  });
});

test('API: All', t => {
  return api.all({}).then(results => {
    t.true(results.hasOwnProperty('items'), 'Has Items');
    t.true(results.hasOwnProperty('pages'), 'Has Pagination');
    t.is(results.items.length, 30, 'Has all 30 items in it');
  });
});

test('API: Content', t => {
  const app = {
    get: word => {
      console.log(word); // eslint-disable-line no-console

      return allTypes;
    },
  };

  return api.types(app).then(apiTypes => {
    const formatted = api.content({}, apiTypes);

    t.true(formatted.hasOwnProperty('items'), 'Has Items');
    t.true(formatted.hasOwnProperty('pages'), 'Has Pagination');
    t.is(formatted.items.length, allTypes.length, 'All content types exist');
  });
});

test('API: Content - Descending', t => {
  const app = {
    get: word => {
      console.log(word); // eslint-disable-line no-console

      return allTypes;
    },
  };

  return api.types(app).then(apiTypes => {
    const formatted = api.content({
      sort_dir: 'desc', // eslint-disable-line camelcase
    }, apiTypes);

    t.true(formatted.hasOwnProperty('items'), 'Has Items');
    t.true(formatted.hasOwnProperty('pages'), 'Has Pagination');
    t.is(formatted.items.length, allTypes.length, 'All content types exist');
  });
});

test.skip('API: ofType', t => {
  const item = Math.round(Math.random() * types.length);

  return api.ofType({}, slugify(types[item])).then(formatted => {
    t.true(formatted.hasOwnProperty('items'), 'Has Items');
    t.true(formatted.hasOwnProperty('pages'), 'Has Pagination');

    if (eachOfType[types[item]] > 30) {
      t.is(formatted.items.length, 30, 'Has all available items');
    }
    else {
      t.is(formatted.items.length, eachOfType[types[item]], 'Has all available items');
    }
  });
});

test('API: One', t => {
  const item = Math.round(Math.random() * content.length);
  const expected = content[item];

  return api.one({}, expected.id).then(result => {
    t.is(result.id, expected.id, 'IDs the same');
    t.true(result.hasOwnProperty('attributes'));
    t.is(result.key, expected.key, 'Key available');
    t.true(result.hasOwnProperty('type'), 'Has type info');
  });
});

test('API: One - Not There', t => {
  return api.one({}, `Test ${Math.round(Math.random() * content.length)}`).then(result => {
    t.deepEqual(result, {}, 'Empty object returned');
  });
});

test.cb.after(t => {
  Promise.map(types, type => {
    return database('live').where('type', type).del();
  }).then(() => {
    t.end();
  }).catch(e => {
    console.error(e);
    t.end();
  });
});
