import test from 'ava';
import uuid from 'uuid';
import cloneDeep from 'lodash/cloneDeep';

import workflows from './fixtures/workflows/all-flows';
import types from './fixtures/types/all-types-merged';
import utils from '../lib/content/utils';

let nextCalled = false;
const next = (err) => {
  nextCalled = err;
};

const req = {
  content: {
    workflows,
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
  const result = utils.type(rq);
  t.is(typeof result, 'string', 'Blank type fails');
});

test('Check type is string', t => {
  const rq = cloneDeep(req);
  rq.params.type = 123;
  let result = utils.type(rq);
  t.is(typeof result, 'string', 'Type must be a string');
  rq.params.type = [];
  result = utils.type(rq);
  t.is(typeof result, 'string', 'Type must be a string');
});

test('Check type exists in CMS', t => {
  const rq = cloneDeep(req);
  rq.params.type = 'foo';
  const result = utils.type(rq);
  t.is(typeof result, 'string', 'Non-existent type fails');
  t.is(result, 'Content Type \'foo\' not found', 'Should fail with message');
});

test('Type exists in all types', t => {
  const rq = cloneDeep(req);
  const result = utils.type(rq);
  t.is(typeof result, 'object', 'Existing type returns an object');
  t.is(result.id, 'services', 'Type object contains merged content type');
  t.true(Array.isArray(result.attributes), 'Type object contains attribute array');
});

//////////////////////////////
// Utils - id check
//////////////////////////////
test('Check content id-not blank', t => {
  const result = utils.id(req.params.id);
  t.is(typeof result, 'string', 'Blank id fails');
  t.is(result, 'Content ID must be in UUID format', 'Should fail with a message');
});

test('Check content id-not object', t => {
  const result = utils.id({});
  t.is(typeof result, 'string', 'Wrong type id fails');
});

test('Check content id-not string', t => {
  const result = utils.id('foo');
  t.is(typeof result, 'string', 'ID not uuid fails');
});

test('Check content id-not just a number', t => {
  const result = utils.id(123);
  t.is(typeof result, 'string', 'ID not uuid fails');
});

test('Check content id - IS uuid', t => {
  const result = utils.id(uuid.v4());
  t.true(result, 'It should be in uuid');
});

//////////////////////////////
// Utils - revision check
//////////////////////////////
test('Check revision id-not blank', t => {
  const result = utils.revision(req);
  t.is(typeof result, 'string', 'Revision cannot be blank');
  t.is(result, 'Revision must be a number', 'Should fail with a message');
});

test('Check revision id-not number', t => {
  let result = utils.revision({});
  t.is(typeof result, 'string', 'Revision must be a number');
  result = utils.revision('foo');
  t.is(typeof result, 'string', 'Revision must be a number');
});

test('Check revision id-not string', t => {
  const result = utils.revision(123);
  t.true(result, 'Revision should be a number');
});

//////////////////////////////
// Utils - URL check
//////////////////////////////
test('URL checks type exists in CMS', t => {
  const rq = cloneDeep(req);
  nextCalled = false;

  rq.params.type = 'foo';
  utils.url(rq, {}, next);

  t.is(typeof nextCalled, 'object', 'Next receives an object');
  t.is(nextCalled.message, 'Content Type \'foo\' not found', 'Should fail with error object');
  t.is(nextCalled.safe, '/content', 'Should have a safe url');
  t.is(nextCalled.status, 404, 'Should be a 404');
});

test('URL checks type has existing workflow in CMS', t => {
  const rq = cloneDeep(req);
  nextCalled = false;

  rq.content.types[0].workflow = 'foo';
  utils.url(rq, {}, next);

  t.is(typeof nextCalled, 'object', 'Next receives an object');
  t.is(nextCalled.message, 'Workflow \'foo\' for Content Type \'Services\' not found', 'Should fail with message');
  t.is(nextCalled.safe, '/content', 'Should have a safe url');
  t.is(nextCalled.status, 404, 'Should be a 404');
});

test('URL checks id is uuid', t => {
  const rq = cloneDeep(req);
  nextCalled = false;

  rq.params.id = 'foo';
  utils.url(rq, {}, next);

  t.is(typeof nextCalled, 'object', 'Next receives an object');
  t.is(nextCalled.message, 'Content ID must be in UUID format', 'Should fail with message');
  t.is(nextCalled.safe, '/content/services', 'Should have a safe url');
  t.is(nextCalled.status, 404, 'Should be a 404');
});

test('URL checks revision is number', t => {
  const rq = cloneDeep(req);
  nextCalled = false;

  rq.params.id = uuid.v4();
  rq.params.revision = 'foo';
  utils.url(rq, {}, next);

  t.is(typeof nextCalled, 'object', 'Next receives an object');
  t.is(nextCalled.message, 'Revision must be a number', 'Should fail with message');
  t.is(nextCalled.safe, `/content/services/${rq.params.id}`, 'Should have a safe url');
  t.is(nextCalled.status, 404, 'Should be a 404');
});

test('URL works with CMS as it is configured', t => {
  const rq = cloneDeep(req);
  nextCalled = false;

  rq.params.id = uuid.v4();
  rq.params.revision = 123;

  utils.url(rq, {}, next);

  t.is(typeof nextCalled, 'string', 'Next receives a string');
  t.is(nextCalled, 'route', 'Next triggers next route');

  nextCalled = false;
  rq.params = {};
  utils.url(rq, {}, next);

  t.is(typeof nextCalled, 'string', 'Next receives a string');
  t.is(nextCalled, 'route', 'Next triggers next route');
});
