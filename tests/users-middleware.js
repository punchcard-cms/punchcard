import test from 'ava';
import uuid from 'uuid';
import cloneDeep from 'lodash/cloneDeep';

import middleware from '../lib/users/middleware';

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
// Utils - URL check
//////////////////////////////
test('URL checks id is there at all', t => {
  const rq = cloneDeep(req);

  return middleware(rq, {}, next).then(() => {
    t.pass();
  }).catch(() => {
    t.fail();
  });
});
test('URL checks id is uuid', t => {
  const rq = cloneDeep(req);
  rq.params.id = 'foo';

  return middleware(rq, {}, next).then(err => {
    t.is(err.message, 'User ID must be in UUID format', 'Should fail with message');
    t.is(err.safe, '/users', 'Should have a safe url');
    t.is(err.status, 404, 'Should be a 404');
  });
});

test('URL without params returns true', t => {
  const rq = cloneDeep(req);
  delete rq.params;

  return middleware(rq, {}, next).then(() => {
    t.pass();
  }).catch(() => {
    t.fail();
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
