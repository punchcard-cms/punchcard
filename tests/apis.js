import test from 'ava';
import slugify from 'underscore.string/slugify';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import isUUID from 'validator/lib/isUUID';

import apiUtils from '../lib/api/utils';
import api from '../lib/api';
import database from '../lib/database';
import utils from './fixtures/_utils';

const generated = 17;
const lang = 'api-test';

const fixtures = utils.generate(generated, lang);

const content = fixtures.content;
const live = fixtures.live;
const types = fixtures.types.names;
const allTypes = fixtures.types.full;

test.cb.before(t => {
  database.init().then(() => {
    database('live').where('language', lang).del().then(() => {
      database('live').insert(live).then(() => {
        t.end();
      }).catch(e => { // because we can't return in a before, this catch doesn't bubble out
        console.error(e.stack); // eslint-disable-line no-console
        t.fail(e.stack);
      });
    });
  })
  .catch(e => {
    console.error(e.stack); // eslint-disable-line no-console
    t.fail(e.stack);
  });
});

test.cb.after.always(t => {
  const items = types.map(type => {
    return database('live').where('type', type).del().then(() => {
      return database('schedule').where('type', type).del();
    });
  });

  Promise.all(items)
    .then(() => {
      t.end();
    })
    .catch(e => {
      t.fail(e);
    });
});

//////////////////////////////
// Utils - attributes
//////////////////////////////
test('Utils: attributes', t => {
  const item = Math.round(Math.random() * (content.length - 1));
  let expected = content[item];
  if (expected === undefined) {
    expected = cloneDeep(content[(content.length - 1)]);
  }

  const model = allTypes.find(typ => {
    return typ.id === expected['type-slug'];
  });

  const attributes = apiUtils.attributes(expected.value, model.attributes);

  t.is(typeof attributes, 'object', 'Should return an object.');
  Object.keys(attributes).map(key => {
    const attr = key.split('-');
    if (attr[attr.length - 1] === 'referencer') {
      if (attributes[key] !== '') {
        t.true(isUUID(attributes[key]), 'includes a uuid');
      }
    }
  });
});

//////////////////////////////
// Utils - format
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
  const item = Math.round(Math.random() * (content.length - 1));
  let expected = cloneDeep(content[item]);

  if (expected === undefined) {
    expected = cloneDeep(content[(content.length - 1)]);
  }

  const model = allTypes.find(typ => {
    return typ.id === expected['type-slug'];
  });

  const formatted = apiUtils.format([expected], model.attributes);

  formatted.forEach(itm => {
    t.true(itm.hasOwnProperty('id'), 'Contains ID');
    t.true(itm.hasOwnProperty('type'), 'Contains Type');
    t.true(itm.hasOwnProperty('type_slug'), 'Contains Type Slug');
    t.true(itm.hasOwnProperty('key'), 'Contains Key');
    t.true(itm.hasOwnProperty('key_slug'), 'Contains Key Slug');
    t.false(itm.hasOwnProperty('meta'), 'Does not contain Meta');
    t.true(itm.hasOwnProperty('attributes'), 'Contains attributes');
  });
});

//////////////////////////////
// Utils - organize
//////////////////////////////
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

//////////////////////////////
// Utils - page
//////////////////////////////
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
    get: () => {
      return allTypes;
    },
  };

  const keys = [
    'name',
    'description',
    'id',
  ];

  const apiTypes = api.types(app);

  t.true(apiTypes.hasOwnProperty('keys'), 'Has keys');
  t.true(apiTypes.hasOwnProperty('all'), 'Has All Content Types');
  t.true(isEqual(apiTypes.keys, keys), 'Keys are as expected');
});

test('API: All', t => {
  return api.all({}).then(results => {
    t.true(results.hasOwnProperty('items'), 'Has Items');
    t.true(results.hasOwnProperty('pages'), 'Has Pagination');
    t.true(results.items.length >= generated, 'Has at least all items in it');
  });
});

test('API: All with Follow', t => {
  return api.all({
    follow: 'true',
  }, allTypes).then(results => {
    let one = false;

    results.items.forEach(item => {
      // Ignore empty object
      if (Object.keys(item).length !== 0) {
        one = true;
        t.true(item.hasOwnProperty('id'), 'Each item has an ID');
        t.true(item.hasOwnProperty('type'), 'Each item has a type');
        t.true(item.type.hasOwnProperty('name'), 'Each item type has an name');
        t.true(item.type.hasOwnProperty('slug'), 'Each item type has an slug');
        t.true(item.type.hasOwnProperty('url'), 'Each item type has an url');
        t.true(item.hasOwnProperty('key'), 'Each item has a key');
        t.true(item.hasOwnProperty('key_slug'), 'Each item has a key_slug');
        t.true(item.hasOwnProperty('attributes'), 'Each item has attributes');
      }
    });
    t.true(results.hasOwnProperty('items'), 'Has Items');
    t.true(results.hasOwnProperty('pages'), 'Has Pagination');
    t.true(results.items.length >= generated, 'Has at least all items in it');
    t.true(one, 'At least one item returned in items');
  });
});

test('API: Content', t => {
  const app = {
    get: () => {
      return allTypes;
    },
  };

  const apiTypes = api.types(app);

  return api.content({}, apiTypes).then(formatted => {
    t.true(formatted.hasOwnProperty('items'), 'Has Items');
    t.true(formatted.hasOwnProperty('pages'), 'Has Pagination');
    t.is(formatted.items.length, allTypes.length, 'All content types exist');
  });
});

test('API: Content - Descending', t => {
  const app = {
    get: () => {
      return allTypes;
    },
  };

  const apiTypes = api.types(app);

  return api.content({
    sort_dir: 'desc', // eslint-disable-line camelcase
  }, apiTypes).then(formatted => {
    t.true(formatted.hasOwnProperty('items'), 'Has Items');
    t.true(formatted.hasOwnProperty('pages'), 'Has Pagination');
    t.is(formatted.items.length, allTypes.length, 'All content types exist');
  });
});

test('API: ofType', t => {
  const item = Math.round(Math.random() * (types.length - 1));
  const type = types[item];

  const model = allTypes.find(typ => {
    return typ.id === slugify(type);
  });

  return api.ofType({}, model).then(formatted => {
    t.true(formatted.hasOwnProperty('items'), 'Has Items');
    t.true(formatted.hasOwnProperty('pages'), 'Has Pagination');
  });
});

test('API: ofType with Follow', t => {
  const item = Math.round(Math.random() * (types.length - 1));
  const type = types[item];

  const model = allTypes.find(typ => {
    return typ.id === slugify(type);
  });

  return api.ofType({
    follow: 'true',
  }, model).then(results => {
    let one = false;

    results.items.forEach(itm => {
      // Ignore empty object
      if (Object.keys(itm).length !== 0) {
        one = true;
        t.true(itm.hasOwnProperty('id'), 'Each item has an ID');
        t.true(itm.hasOwnProperty('type'), 'Each item has a type');
        t.true(itm.type.hasOwnProperty('name'), 'Each item type has an name');
        t.true(itm.type.hasOwnProperty('slug'), 'Each item type has an slug');
        t.true(itm.type.hasOwnProperty('url'), 'Each item type has an url');
        t.true(itm.hasOwnProperty('key'), 'Each item has a key');
        t.true(itm.hasOwnProperty('key_slug'), 'Each item has a key_slug');
        t.true(itm.hasOwnProperty('attributes'), 'Each item has attributes');
      }
    });
    t.true(results.hasOwnProperty('items'), 'Has Items');
    t.true(results.hasOwnProperty('pages'), 'Has Pagination');
    t.true(one, 'At least one item returned in items');
  });
});

test('API: One', t => {
  const item = Math.round(Math.random() * (content.length - 1));
  let expected = cloneDeep(content[item]);

  if (expected === undefined) {
    expected = cloneDeep(content[(content.length - 1)]);
  }

  const model = allTypes.find(typ => {
    return typ.id === expected['type-slug'];
  });

  return api.one({}, expected.id, model.attributes).then(result => {
    t.is(result.id, expected.id, 'IDs the same');
    t.true(result.hasOwnProperty('attributes'));
    t.is(result.key_slug, expected.slug, 'Key available');
    t.true(result.hasOwnProperty('type'), 'Has type info');
  });
});

test('API: One - Not There', t => {
  return api.one({}, `Test ${Math.round(Math.random() * content.length)}`).then(result => {
    t.deepEqual(result, {}, 'Empty object returned');
  });
});


//////////////////////////////
// AFTER ALL TESTS RUN
//////////////////////////////
test.cb.after(t => {
  database('live').where('language', lang).del().then(() => {
    t.end();
  })
  .catch(e => {
    console.error(e.stack); // eslint-disable-line no-console
    t.end();
  });
});
