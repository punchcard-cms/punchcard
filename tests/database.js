import test from 'ava';
import db from '../lib/database';

test('Database Initialization', t => {
  return db.init().then(() => {
    t.pass();
  });
});
