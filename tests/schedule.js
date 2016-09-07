import test from 'ava';
import moment from 'moment';
import Promise from 'bluebird';
import sutils from '../lib/schedule/utils';
import putils from '../lib/utils';
import utils from './fixtures/_utils';
import db from '../lib/database';

const items = utils.generate();
const length = items.content.length;
const count = Math.floor(Math.random() * length);

test('Setup', t => {
  const item = count;
  const revision = items.content[item];

  return sutils.setup(revision).then(() => {
    return db('schedule').select('*').where({
      id: revision.id,
      revision: revision.revision,
    });
  }).then(result => {
    const attrs = typeof result[0].attributes === 'string' ? JSON.parse(result[0].attributes) : result[0].attributes;
    t.is(result.length, 1, 'One item added');
    t.deepEqual(attrs, revision.value);
  }).catch(e => {
    console.error(e.message);
    t.fail(e.message);
  });
});

test('Push', t => {
  const item = count + 1 > length - 1 ? 1 : count + 1;
  const revision = items.content[item];

  revision.sunset = null;

  return sutils.setup(revision).then(() => {
    return sutils.push(revision);
  }).then(() => {
    return db('live').select('*').where({
      id: revision.id,
      revision: revision.revision,
    });
  }).then(result => {
    const attrs = typeof result[0].attributes === 'string' ? JSON.parse(result[0].attributes) : result[0].attributes;
    t.is(result.length, 1, 'One item added');
    t.deepEqual(attrs, revision.value);
  }).catch(e => {
    console.error(e.message);
    t.fail(e.message);
  });
});


test('Pull', t => {
  const item = count + 2 > length - 1 ? 2 : count + 2;
  const revision = items.content[item];

  revision.sunset = putils.time.iso(moment().format('YYYY-MM-DD'), moment().subtract(1, 'minute').format('hh:mm'), 'America/New_York');

  return db('live').insert({
    'id': revision.id,
    'revision': revision.revision,
    'language': revision.language,
    'sunrise': revision.sunrise,
    'sunset': revision.sunset,
    'attributes': revision.value,
    'type': revision.type,
    'key': revision.identifier,
    'type-slug': revision['type-slug'],
    'key-slug': revision.slug,
  }).then(() => {
    return sutils.pull(revision);
  }).then(() => {
    return db('live').select('*').where({
      id: revision.id,
      revision: revision.revision,
    });
  }).then(result => {
    t.is(result.length, 0, 'Item deleted');
  }).catch(e => {
    console.error(e.message);
    t.fail(e.message);
  });
});

test('Sunrise', t => {
  const item = count + 3 > length - 1 ? 3 : count + 3;
  const revision = items.content[item];

  revision.sunset = null;

  return sutils.setup(revision).then(() => {
    return sutils.sunrise(revision);
  }).then(() => {
    return Promise.delay(200);
  }).then(() => {
    return db('live').select('*').where({
      id: revision.id,
    });
  }).then(result => {
    const attrs = typeof result[0].attributes === 'string' ? JSON.parse(result[0].attributes) : result[0].attributes;
    t.is(result.length, 1, 'One item added');
    t.deepEqual(attrs, revision.value);
  }).catch(e => {
    console.error(e.message);
    t.fail(e.message);
  });
});

test('Sunset', t => {
  const item = count + 4 > length - 1 ? 4 : count + 4;
  const revision = items.content[item];

  revision.sunset = putils.time.iso(moment().format('YYYY-MM-DD'), moment().format('hh:mm'), 'America/New_York');

  return db('live').insert({
    'id': revision.id,
    'revision': revision.revision,
    'language': revision.language,
    'sunrise': revision.sunrise,
    'sunset': revision.sunset,
    'attributes': revision.value,
    'type': revision.type,
    'key': revision.identifier,
    'type-slug': revision['type-slug'],
    'key-slug': revision.slug,
  }).then(() => {
    return sutils.sunset(revision);
  }).then(() => {
    return Promise.delay(200);
  }).then(() => {
    return db('live').select('*').where({
      id: revision.id,
      revision: revision.revision,
    });
  }).then(result => {
    t.is(result.length, 0, 'Item deleted');
  }).catch(e => {
    console.error(e.message);
    t.fail(e.message);
  });
});
