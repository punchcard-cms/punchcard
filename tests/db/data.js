import test from 'ava';
import plugin from '../../lib/db/data';
import mockDb from 'mock-knex';

const tracker = mockDb.getTracker();

tracker.install();
const db = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
});
test.beforeEach(() => {
  mockDb.mock(db);
});

test.afterEach(() => {
  mockDb.unmock(db);
});

test('Get an entire table', t => {
  const getTable = plugin.getTable('services', db);
  tracker.once('query', query => {
    query.response([
      {
        title: 'Service Foo',
      },
      {
        title: 'Service Bar',
      },
      {
        title: 'Service Baz',
      },
    ]);
  });

  return getTable.table('table').select('title')
    .then(model => {
      t.is(model[0].title, 'Service Foo', 'Should be the first title in the first object');
      t.is(model[1].title, 'Service Bar', 'Should be the first title in the second object.');
    });
});
