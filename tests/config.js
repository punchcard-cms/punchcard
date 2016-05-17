import test from 'ava';
process.env.NODE_CONFIG_DIR = '../config';
import config from 'config';

const knex = config.get('knex');

test('Knex DB configuration host', t => {
  t.not(knex.connection.host, '');
});

test('Knex DB configuration port', t => {
  t.not(knex.connection.user, '');
});
test('Knex DB configuration dbName', t => {
  t.not(knex.connection.database, '');
});
