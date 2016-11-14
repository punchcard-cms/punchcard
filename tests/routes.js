import test from 'ava';
import uuid from 'uuid';

import utils from '../lib/routes/utils';


//////////////////////////////
// Routes - Action variable
//////////////////////////////
test('Action add', t => {
  return utils.actions('add').then(res => {
    t.true(res, 'Should return true on add action');
  });
});

test('Check action - must be string', t => {
  return utils.actions({}).catch(err => {
    t.is(typeof err, 'string', 'Non-uuid id fails');
    t.is(err, 'Content ID must be in UUID format', 'Should fail with a message');
  });
});

test('Check action - string, but not number', t => {
  return utils.actions('123').catch(err => {
    t.is(typeof err, 'string', 'Non-uuid id fails');
    t.is(err, 'Content ID must be in UUID format', 'Should fail with a message');
  });
});

test('Check action - must match an action', t => {
  return utils.actions('foo').catch(err => {
    t.is(typeof err, 'string', 'Non-uuid id fails');
    t.is(err, 'Content ID must be in UUID format', 'Should fail with a message');
  });
});

test('Check content id - no id param', t => {
  return utils.actions().then(result => {
    t.true(result, 'No id returns true');
  });
});

test('Check content id - IS action', t => {
  return utils.actions('add').then(result => {
    t.true(result, 'Action id returns true');
  });
});

test('Check content id - IS uuid', t => {
  return utils.actions(uuid.v4()).then(result => {
    t.true(result, 'Good id returns true');
  });
});
