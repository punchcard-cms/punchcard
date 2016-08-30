import test from 'ava';
import uuid from 'uuid';
import cloneDeep from 'lodash/cloneDeep';

import types from './fixtures/content-types/objects/all-merged';
import utils from '../lib/content/utils';

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
  content: {
    types,
  },
  params: {
    type: 'services',
    id: '',
    revision: '',
  },
};

//////////////////////////////
// Utils - type check
//////////////////////////////
test('Check type exists', t => {
  const rq = cloneDeep(req);
  rq.params.type = '';

  return utils.type(rq).catch(err => {
    t.is(typeof err, 'string', 'Blank type fails');
    t.is(err, 'Content Type \'(no type given)\' not found', 'error message');
  });
});

test('Check type is string', t => {
  const rq = cloneDeep(req);
  rq.params.type = 123;

  return utils.type(rq).catch(err => {
    t.is(typeof err, 'string', 'Non-string fails');
    t.is(err, 'Content Type \'123\' not found', 'error message');
  });
});

test('Check type is string', t => {
  const rq = cloneDeep(req);
  rq.params.type = [];

  return utils.type(rq).catch(err => {
    t.is(typeof err, 'string', 'Non-string fails');
    t.is(err, 'Content Type \'(no type given)\' not found', 'error message');
  });
});

test('Check type exists in CMS', t => {
  const rq = cloneDeep(req);
  rq.params.type = 'foo';

  return utils.type(rq).catch(err => {
    t.is(typeof err, 'string', 'Non-existent type fails');
    t.is(err, 'Content Type \'foo\' not found', 'Should fail with message');
  });
});

test('Type exists in all types', t => {
  const rq = cloneDeep(req);

  return utils.type(rq).then(result => {
    t.is(typeof result, 'object', 'Existing type returns an object');
    t.is(result.id, 'services', 'Type object contains merged content type');
    t.true(Array.isArray(result.attributes), 'Type object contains attribute array');
  });
});

//////////////////////////////
// Utils - id check
//////////////////////////////
test('Check content id-not blank', t => {
  const rq = cloneDeep(req);

  return utils.id(rq).catch(err => {
    t.is(typeof err, 'string', 'Blank id fails');
    t.is(err, 'Content ID must be in UUID format', 'Should fail with a message');
  });
});

test('Check content id-not object', t => {
  const rq = cloneDeep(req);
  rq.params.id = {};

  return utils.id(rq).catch(err => {
    t.is(typeof err, 'string', 'Non-uuid id fails');
    t.is(err, 'Content ID must be in UUID format', 'Should fail with a message');
  });
});

test('Check content id-not string', t => {
  const rq = cloneDeep(req);
  rq.params.id = 'foo';

  return utils.id(rq).catch(err => {
    t.is(typeof err, 'string', 'Non-uuid id fails');
    t.is(err, 'Content ID must be in UUID format', 'Should fail with a message');
  });
});

test('Check content id-not just a number', t => {
  const rq = cloneDeep(req);
  rq.params.id = 123;

  return utils.id(rq).catch(err => {
    t.is(typeof err, 'string', 'Non-uuid id fails');
    t.is(err, 'Content ID must be in UUID format', 'Should fail with a message');
  });
});

test('Check content id - no id param', t => {
  const rq = cloneDeep(req);
  delete rq.params.id;

  return utils.id(rq).then(result => {
    t.true(result, 'No id returns true');
  });
});

test('Check content id - IS action', t => {
  const rq = cloneDeep(req);
  rq.params.id = 'add';

  return utils.id(rq).then(result => {
    t.true(result, 'Action id returns true');
  });
});

test('Check content id - IS uuid', t => {
  const rq = cloneDeep(req);
  rq.params.id = uuid.v4();

  return utils.id(rq).then(result => {
    t.true(result, 'Good id returns true');
  });
});

//////////////////////////////
// Utils - revision check
//////////////////////////////
test('Check revision id-not blank', t => {
  const rq = cloneDeep(req);

  return utils.revision(rq).catch(err => {
    t.is(typeof err, 'string', 'Blank revision fails');
    t.is(err, 'Revision must be a number', 'Should fail with a message');
  });
});

test('Check revision id-not number', t => {
  const rq = cloneDeep(req);
  rq.params.revision = 'foo';

  return utils.revision(rq).catch(err => {
    t.is(typeof err, 'string', 'Non-number revision fails');
    t.is(err, 'Revision must be a number', 'Should fail with a message');
  });
});

test('No revision - good', t => {
  const rq = cloneDeep(req);
  delete rq.params.revision;

  return utils.revision(rq).then(result => {
    t.true(result, 'Nonexistent revision returns true');
  });
});

test('Check revision  - good', t => {
  const rq = cloneDeep(req);
  rq.params.revision = 123;

  return utils.revision(rq).then(result => {
    t.true(result, 'Good revision type returns true');
  });
});


//////////////////////////////
// Utils - URL check
//////////////////////////////
test('URL checks type exists in CMS', t => {
  const rq = cloneDeep(req);
  rq.params.type = 'foo';

  return utils.url(rq, {}, next).then(err => {
    t.is(err.message, 'Content Type \'foo\' not found', 'Should fail with error object');
    t.is(err.safe, '/content', 'Should have a safe url');
    t.is(err.status, 404, 'Should be a 404');
  });
});

test('URL checks id is uuid', t => {
  const rq = cloneDeep(req);
  rq.params.id = 'foo';

  return utils.url(rq, {}, next).then(err => {
    t.is(err.message, 'Content ID must be in UUID format', 'Should fail with message');
    t.is(err.safe, '/content', 'Should have a safe url');
    t.is(err.status, 404, 'Should be a 404');
  });
});

test('URL checks revision is number', t => {
  const rq = cloneDeep(req);
  rq.params.id = uuid.v4();
  rq.params.revision = 'foo';

  return utils.url(rq, {}, next).then(err => {
    t.is(err.message, 'Revision must be a number', 'Should fail with message');
    t.is(err.safe, '/content', 'Should have a safe url');
    t.is(err.status, 404, 'Should be a 404');
  });
});

test('URL works with CMS as it is configured', t => {
  const rq2 = cloneDeep(req);
  rq2.params.id = uuid.v4();
  rq2.params.revision = 2345;

  return utils.url(rq2, {}, next).then(() => {
    t.pass();
  }).catch(() => {
    t.fail();
  });
});
