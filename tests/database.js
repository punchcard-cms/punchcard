import test from 'ava';
import config from 'config';
import _ from 'lodash';

import db from '../lib/database';

test('Database Initialization', t => {
  return db.init().then(() => {
    t.pass();
  }).catch(e => {
    if (_.includes(e.message, `database "${config.knex.connection.database}" does not exist`)) {
      // warning added for safety
      console.log('--------------------------------------------------------------------------'); // eslint-disable-line no-console
      console.log(`WARNING: you MUST create the ${config.knex.connection.database} database. See Punchcard README for details.`); // eslint-disable-line no-console
      console.log('--------------------------------------------------------------------------'); // eslint-disable-line no-console
    }
    t.fail(e.message);
  });
});
