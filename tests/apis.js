import test from 'ava';
import slugify from 'underscore.string/slugify';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';

import apiUtils from '../lib/api/utils';
import api from '../lib/api';
import database from '../lib/database';
import utils from './fixtures';

const generated = 17;
const lang = 'api-test';

const fixtures = utils.generate(generated, lang);

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

/**
 * Randomly selects a piece of content from source, and it's content-type model
 *
 * @param  {object} source object of content
 * @returns {object}  - selected content and its model
 */
const testables = source => {
  const random = Math.round(Math.random() * (source.length - 1));
  let expected = source[random];
  if (expected === undefined) {
    expected = cloneDeep(source[(source.length - 1)]);
  }

  const model = allTypes.find(typ => {
    return typ.id === expected['type-slug'];
  });

  return {
    expected,
    model,
  };
};

//////////////////////////////
// Utils - attributes
//////////////////////////////
test.serial.skip('Utils: attributes - empty query', t => {
  const testable = testables(live);

  const query = {};

  const attributes = apiUtils.attributes(testable.expected.attributes, testable.model.attributes, allTypes, query);

  return attributes.then(result => {
    t.is(typeof result, 'object', 'Should contain result, an object.');
    t.is(Object.keys(result).length, 6, 'Should contain six main objects.');

    utils.referencer(t, result);
  })
  .catch(e => {
    console.error(e.stack); // eslint-disable-line no-console
    t.fail(e);
    t.end();
  });
});

test.serial.skip('Utils: attributes - depth 0', t => {
  const testable = testables(live);

  const query = {
    depth: 0,
  };

  const attributes = apiUtils.attributes(testable.expected.attributes, testable.model.attributes, allTypes, query);

  return attributes.then(result => {
    t.is(typeof result, 'object', 'Should contain result, an object.');

    utils.referencer(t, result);
  })
  .catch(e => {
    console.error(e.stack); // eslint-disable-line no-console
    t.fail(e);
    t.end();
  });
});

test.serial.skip('Utils: attributes - depth 1', t => {
  const testable = testables(live);

  const query = {
    depth: 1,
  };

  const attributes = apiUtils.attributes(testable.expected.attributes, testable.model.attributes, allTypes, query);

  return attributes.then(result => {
    t.is(typeof result, 'object', 'Should contain result, an object.');

    utils.referencer(t, result);
  })
  .catch(e => {
    console.error(e.stack); // eslint-disable-line no-console
    t.fail(e);
    t.end();
  });
});

test.serial.skip('Utils: attributes - depth 2', t => {
  const testable = testables(live);

  const query = {
    depth: 2,
  };

  const attributes = apiUtils.attributes(testable.expected.attributes, testable.model.attributes, allTypes, query);

  return attributes.then(result => {
    t.is(typeof result, 'object', 'Should contain result, an object.');

    Object.keys(result).forEach(key => {
      utils.referencer(t, result[key]);
    });
  })
  .catch(e => {
    console.error(e.stack); // eslint-disable-line no-console
    t.fail(e);
    t.end();
  });
});

test.serial.skip('Utils: attributes - no references', t => {
  const testable = testables(live);

  Object.keys(testable.expected.attributes).forEach(attr => {
    if (attr.split('-').indexOf('referencer') > -1) {
      delete testable.expected.attributes[attr];
    }
  });

  let modelattrs = cloneDeep(testable.model.attributes);
  modelattrs = modelattrs.map(attr => {
    if (attr.id.split('-').indexOf('referencer') < 0) {
      return attr;
    }

    return false;
  }).filter(attr => {
    return attr !== false;
  });

  const query = {
    depth: 0,
  };

  const attributes = apiUtils.attributes(testable.expected.attributes, modelattrs, allTypes, query);

  return attributes.then(result => {
    t.is(typeof result, 'object', 'Should contain result, an object.');
    t.is(Object.keys(result).length, 2, 'Should contain two main objects.');
  })
  .catch(e => {
    console.error(e.stack); // eslint-disable-line no-console
    t.fail(e);
    t.end();
  });
});

//////////////////////////////
// Utils - format
//////////////////////////////
test.serial.skip('Utils: Format Results - List', t => {
  const formatted = apiUtils.format(live.slice(0, 9));

  return formatted.then(result => {
    result.forEach(item => {
      utils.formatted(t, item);
    });
  });
});

test.serial.skip('Utils: Format Results - no query', t => {
  const testable = testables(live);

  const formatted = apiUtils.format([testable.expected], testable.model.attributes, allTypes);

  return formatted.then(result => {
    result.forEach(itm => {
      utils.formatted(t, itm);
    });
  });
});

test.serial.skip('Utils: Format Results - query depth zero', t => {
  const testable = testables(live);
  const query = {
    depth: 0,
  };

  const formatted = apiUtils.format([testable.expected], testable.model.attributes, allTypes, query);

  return formatted.then(result => {
    result.forEach(itm => {
      utils.formatted(t, itm);
    });
  });
});

test.serial.skip('Utils: Format Results - query depth one', t => {
  const testable = testables(live);
  const query = {
    depth: 1,
  };

  const formatted = apiUtils.format([testable.expected], testable.model.attributes, allTypes, query);

  return formatted.then(result => {
    result.forEach(itm => {
      utils.formatted(t, itm);
      t.true(itm.hasOwnProperty('attributes'), 'Contains attributes');

      Object.keys(itm.attributes).forEach(attr => {
	if (attr.split('-').indexOf('referencer') > -1) {
	  if (itm.attributes[attr].hasOwnProperty('id')) {
	    utils.formatted(t, itm.attributes[attr]);
	  }
	  else if (!Array.isArray(itm.attributes[attr])) {
	    Object.keys(itm.attributes[attr]).forEach(atr => {
	      utils.formatted(t, itm.attributes[attr][atr]);
	    });
	  }
	}
      });
    });
  });
});

test.serial.skip('Utils: Format Results - query depth two', t => {
  const testable = testables(live);
  const query = {
    depth: 2,
  };

  const formatted = apiUtils.format([testable.expected], testable.model.attributes, allTypes, query);

  return formatted.then(result => {
    result.forEach(itm => {
      utils.formatted(t, itm);
      t.true(itm.hasOwnProperty('attributes'), 'Contains attributes');

      Object.keys(itm.attributes).forEach(attr => {
	if (attr.split('-').indexOf('referencer') > -1) {
	  if (itm.attributes[attr].hasOwnProperty('id')) {
	    utils.formatted(t, itm.attributes[attr]);
	    Object.keys(itm.attributes[attr]).forEach(atr => {
	      if (atr.split('-').indexOf('referencer') > -1) {
		if (itm.attributes[attr][atr].hasOwnProperty('id')) {
		  utils.formatted(t, itm.attributes[attr][atr]);
		}
		else if (!Array.isArray(itm.attributes[attr][atr])) {
		  Object.keys(itm.attributes[attr][atr]).forEach(ar => {
		    utils.formatted(t, itm.attributes[attr][atr][ar]);
		  });
		}
	      }
	    });
	  }
	  else if (!Array.isArray(itm.attributes[attr])) {
	    Object.keys(itm.attributes[attr]).forEach(atr => {
	      utils.formatted(t, itm.attributes[attr][atr]);
	    });
	  }
	}
      });
    });
  });
});

//////////////////////////////
// Utils - organize
//////////////////////////////
test.serial('Utils: Organize - Default', t => {
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

test.serial('Utils: Organize - Lookup', t => {
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

test.serial('Utils: Organize - Bad Lookup', t => {
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

test.serial('Utils: Organize - Custom', t => {
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

test.serial('Utils: Organize - Wrong', t => {
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

test.serial('Utils: Organize - Wrong Pages', t => {
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
test.serial('Utils: Page - First', t => {
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

test.serial('Utils: Page - Middle', t => {
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

test.serial('Utils: Page - End', t => {
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

test.serial('Utils: Page - One', t => {
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

test.serial('Utils: Page - None', t => {
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
test.serial('APIs: Types', t => {
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

test.serial('API: All', t => {
  return api.all({}, allTypes).then(results => {
    t.true(results.hasOwnProperty('items'), 'Has Items');
    t.true(results.hasOwnProperty('pages'), 'Has Pagination');
    t.true(results.items.length >= generated, 'Has at least all items in it');
  });
});

test.serial.skip('API: All with Follow', t => {
  return api.all({
    follow: 'true',
    depth: 1,
  }, allTypes).then(results => {
    let one = false;

    results.items.forEach(item => {
      // Ignore empty object
      if (Object.keys(item).length !== 0) {
	one = true;
	utils.formatted(t, item);
      }
    });
    t.true(results.hasOwnProperty('items'), 'Has Items');
    t.true(results.hasOwnProperty('pages'), 'Has Pagination');
    t.true(results.items.length >= generated, 'Has at least all items in it');

    if (results.items.length > 0) {
      t.true(one, 'At least one item returned in items');
    }
  });
});

test.serial('API: Content', t => {
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

test.serial('API: Content - Descending', t => {
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

test.serial('API: ofType', t => {
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

test.serial.skip('API: ofType with Follow', t => {
  const item = Math.round(Math.random() * (types.length - 1));
  const type = types[item];

  const model = allTypes.find(typ => {
    return typ.id === slugify(type);
  });

  return api.ofType({
    follow: 'true',
    depth: 1,
  }, model, allTypes).then(results => {
    let one = false;

    results.items.forEach(itm => {
      // Ignore empty object
      if (Object.keys(itm).length !== 0) {
	one = true;
	utils.formatted(t, itm);
      }
    });
    t.true(results.hasOwnProperty('items'), 'Has Items');
    t.true(results.hasOwnProperty('pages'), 'Has Pagination');

    if (results.items.length > 0) {
      t.true(one, 'At least one item returned in items');
    }
  });
});


test.serial.skip('API: One', t => {
  const testable = testables(live);
  const query = {
    depth: 1,
  };

  return api.one(query, testable.expected.id, testable.model.attributes, allTypes, database).then(result => {
    t.is(result.id, testable.expected.id, 'IDs the same');
    t.true(result.hasOwnProperty('attributes'));
    t.is(result.key_slug, testable.expected['key-slug'], 'Key available');
    t.true(result.hasOwnProperty('type'), 'Has type info');
  });
});

test.serial('API: One - Not There', t => {
  return api.one({}, `Test ${Math.round(Math.random() * (live.length - 1))}`).then(result => {
    t.deepEqual(result, {}, 'Empty object returned');
  });
});


//////////////////////////////
// AFTER ALL TESTS RUN
//////////////////////////////
test.cb.after.always(t => {
  database('live').where('language', lang).del().then(() => {
    t.end();
  })
  .catch(e => {
    console.error(e.stack); // eslint-disable-line no-console
    t.fail(e);
    t.end();
  });
});
