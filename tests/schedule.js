import test from 'ava';
import moment from 'moment';
import Promise from 'bluebird';

import sutils from '../lib/schedule/utils';
import putils from '../lib/utils';
import utils from './fixtures';
import database from '../lib/database';
import apps from './fixtures/applications/objects/database-mocks.js';

const lang = 'schedule-test';
const generated = 23;

const fixtures = utils.generate(generated, lang);

const length = fixtures.content.length;
const count = Math.floor(Math.random() * length);

test.cb.before(t => {
  database.init().then(() => {
    database('live').where('language', lang).del().then(() => {
      t.end();
    }).catch(e => { // because we can't return in a before, this catch doesn't bubble out
      console.error(e.stack); // eslint-disable-line no-console
      t.fail(e.stack);
    });
  })
  .catch(e => {
    console.error(e.stack); // eslint-disable-line no-console
    t.fail(e.stack);
  });
});

test.skip('Setup', t => {
  const item = count;
  const revision = fixtures.content[item];

  return sutils.setup(revision).then(() => {
    return database('schedule').select('*').where({
      id: revision.id,
      revision: revision.revision,
    });
  }).then(result => {
    const attrs = typeof result[0].attributes === 'string' ? JSON.parse(result[0].attributes) : result[0].attributes;
    t.is(result.length, 1, 'One item added');
    t.deepEqual(attrs, revision.value);
  }).catch(e => {
    console.error(e.message); // eslint-disable-line no-console
    t.fail(e.message);
  });
});

test('Push', t => {
  const item = count + 1 > length - 1 ? 1 : count + 1;
  const revision = fixtures.content[item];
  const sunrise = moment(revision.sunrise).subtract(2, 'days');

  revision.sunset = null;
  revision.sunrise = putils.time.iso(sunrise.format('YYYY-MM-DD'), sunrise.format('hh:mm'), 'America/New_York');

  return sutils.setup(revision).then(() => {
    return sutils.push(revision, apps.rows);
  }).then(() => {
    return database('live').select('*').where({
      id: revision.id,
      revision: revision.revision,
    });
  }).then(result => {
    const attrs = typeof result[0].attributes === 'string' ? JSON.parse(result[0].attributes) : result[0].attributes;
    t.is(result.length, 1, 'One item added');
    t.deepEqual(attrs, revision.value);
  }).catch(e => {
    console.error(e.message); // eslint-disable-line no-console
    t.fail(e.message);
  });
});


test('Pull', t => {
  const item = count + 2 > length - 1 ? 2 : count + 2;
  const revision = fixtures.content[item];

  revision.sunset = putils.time.iso(moment().subtract(1, 'days').format('YYYY-MM-DD'), moment().format('hh:mm'), 'America/New_York');

  return database('live').insert({
    'id': revision.id,
    'revision': revision.revision,
    'language': lang,
    'sunrise': revision.sunrise,
    'sunset': revision.sunset,
    'attributes': revision.value,
    'type': revision.type,
    'key': revision.identifier,
    'type-slug': revision['type-slug'],
    'key-slug': revision.slug,
  }).then(() => {
    return sutils.pull(revision, apps.rows);
  }).then(() => {
    return database('live').select('*').where({
      id: revision.id,
      revision: revision.revision,
    });
  }).then(result => {
    t.is(result.length, 0, 'Item deleted');
  }).catch(e => {
    console.error(e.message); // eslint-disable-line no-console
    t.fail(e.message);
  });
});

test.skip('Sunrise', t => {
  const item = count + 3 > length - 1 ? 3 : count + 3;
  const revision = fixtures.content[item];
  const sunrise = moment(revision.sunrise).subtract(5, 'minutes');

  revision.sunset = null;
  revision.sunrise = putils.time.iso(sunrise.format('YYYY-MM-DD'), sunrise.format('hh:mm'), 'America/New_York');

  return sutils.setup(revision).then(() => {
    return sutils.sunrise(revision, apps.rows);
  }).then(() => {
    return Promise.delay(200);
  }).then(() => {
    return database('live').select('*').where({
      id: revision.id,
    });
  }).then(result => {
    const attrs = typeof result[0].attributes === 'string' ? JSON.parse(result[0].attributes) : result[0].attributes;
    t.is(result.length, 1, 'One item added');
    t.deepEqual(attrs, revision.value);
  }).catch(e => {
    console.error(e.message); // eslint-disable-line no-console
    t.fail(e.message);
  });
});

test.skip('Sunset', t => {
  const item = count + 4 > length - 1 ? 4 : count + 4;
  const revision = fixtures.content[item];

  revision.sunset = putils.time.iso(moment().subtract(1, 'days').format('YYYY-MM-DD'), moment().format('hh:mm'), 'America/New_York');

  return database('live').insert({
    'id': revision.id,
    'revision': revision.revision,
    'language': lang,
    'sunrise': revision.sunrise,
    'sunset': revision.sunset,
    'attributes': revision.value,
    'type': revision.type,
    'key': revision.identifier,
    'type-slug': revision['type-slug'],
    'key-slug': revision.slug,
  }).then(() => {
    return sutils.sunset(revision, apps.rows);
  }).then(() => {
    return Promise.delay(200);
  }).then(() => {
    return database('live').select('*').where({
      id: revision.id,
      revision: revision.revision,
    });
  }).then(result => {
    t.is(result.length, 0, 'Item deleted');
  }).catch(e => {
    console.error(e.message); // eslint-disable-line no-console
    t.fail(e.message);
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
