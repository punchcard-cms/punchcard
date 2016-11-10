import test from 'ava';
import uuid from 'uuid';
import cloneDeep from 'lodash/cloneDeep';

import middleware from '../lib/users/middleware';
import utils from '../lib/users/middleware/utils';

/**
 * Next
 *
 * @param {object} value object send to next
 *
 * @returns {object} whatever the function received
 */
const next = (value) => {
  return value;
};

const req = {
  params: {
    id: '',
  },
};

//////////////////////////////
// Utils - id check
//////////////////////////////
test('Check user id-bad blank', t => {
  const rq = cloneDeep(req);

  return utils.id(rq).catch(err => {
    t.is(typeof err, 'string', 'Blank id fails');
    t.is(err, 'User ID must be in UUID format', 'Should fail with a message');
  });
});

test('Check user id-bad empty string', t => {
  const rq = cloneDeep(req);
  rq.params.id = '';

  return utils.id(rq).catch(err => {
    t.is(typeof err, 'string', 'Non-uuid id fails');
    t.is(err, 'User ID must be in UUID format', 'Should fail with a message');
  });
});

test('Check user id-bad object', t => {
  const rq = cloneDeep(req);
  rq.params.id = {};

  return utils.id(rq).catch(err => {
    t.is(typeof err, 'string', 'Non-uuid id fails');
    t.is(err, 'User ID must be in UUID format', 'Should fail with a message');
  });
});

test('Check user id-bad string', t => {
  const rq = cloneDeep(req);
  rq.params.id = 'foo';

  return utils.id(rq).catch(err => {
    t.is(typeof err, 'string', 'Non-uuid id fails');
    t.is(err, 'User ID must be in UUID format', 'Should fail with a message');
  });
});

test('Check user id-bad just a number', t => {
  const rq = cloneDeep(req);
  rq.params.id = 123;

  return utils.id(rq).catch(err => {
    t.is(typeof err, 'string', 'Non-uuid id fails');
    t.is(err, 'User ID must be in UUID format', 'Should fail with a message');
  });
});

test('Check user id - no id param', t => {
  const rq = cloneDeep(req);
  delete rq.params.id;

  return utils.id(rq).then(result => {
    t.true(result, 'No id returns true');
  });
});

test('Check user id - good ADD action', t => {
  const rq = cloneDeep(req);
  rq.params.id = 'add';

  return utils.id(rq).then(result => {
    t.true(result, 'Action add returns true');
  });
});

test('Check user id - good SAVE action', t => {
  const rq = cloneDeep(req);
  rq.params.id = 'save';

  return utils.id(rq).then(result => {
    t.true(result, 'Action add returns true');
  });
});

test('Check user id - IS uuid', t => {
  const rq = cloneDeep(req);
  rq.params.id = uuid.v4();

  return utils.id(rq).then(result => {
    t.true(result, 'Good id returns true');
  });
});



//////////////////////////////
// Utils - URL check
//////////////////////////////
test('URL checks id is uuid', t => {
  const rq = cloneDeep(req);
  rq.params.id = 'foo';

  return middleware(rq, {}, next).then(err => {
    t.is(err.message, 'User ID must be in UUID format', 'Should fail with message');
    t.is(err.safe, '/users', 'Should have a safe url');
    t.is(err.status, 404, 'Should be a 404');
  });
});

test('URL works with CMS as it is configured', t => {
  const rq2 = cloneDeep(req);
  rq2.params.id = uuid.v4();

  return middleware(rq2, {}, next).then(() => {
    t.pass();
  }).catch(() => {
    t.fail();
  });
});
