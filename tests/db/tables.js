import test from 'ava';
import tables from '../../lib/db/tables';
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

test('Do not Create Table if already exists', t => {
  tracker.on('query', query => {
    query.response([true]);
  });
  tables.createTable(db, 'services').then(response => {
    t.is(response, 'table services EXISTS');
  });
});
