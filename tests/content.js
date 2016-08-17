import test from 'ava';
import uuid from 'uuid';
import cloneDeep from 'lodash/cloneDeep';

import allFlows from './fixtures/workflows/all-flows';
import allTypes from './fixtures/types-post-merge';
import utils from '../lib/content/utils';

const req = {
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
  const result = utils.check.type(rq, allTypes);
  t.is(typeof result, 'string', 'Blank type fails');
});

test('Check type is string', t => {
  const rq = cloneDeep(req);
  rq.params.type = 123;
  let result = utils.check.type(rq, allTypes);
  t.is(typeof result, 'string', 'Type must be a string');
  rq.params.type = [];
  result = utils.check.type(rq, allTypes);
  t.is(typeof result, 'string', 'Type must be a string');
});

test('Check type exists in CMS', t => {
  const rq = cloneDeep(req);
  rq.params.type = 'foo';
  const result = utils.check.type(rq, allTypes);
  t.is(typeof result, 'string', 'Non-existent type fails');
  t.is(result, 'Content Type \'foo\' not found', 'Should fail with message');
});

test('Type exists in all types', t => {
  const rq = cloneDeep(req);
  const result = utils.check.type(rq, allTypes);
  t.is(typeof result, 'object', 'Existing type returns an object');
  t.is(result.id, 'services', 'Type object contains merged content type');
  t.true(Array.isArray(result.attributes), 'Type object contains attribute array');
});

//////////////////////////////
// Utils - id check
//////////////////////////////
test('Check content id-not blank', t => {
  const result = utils.check.id(req.params.id);
  t.is(typeof result, 'string', 'Blank id fails');
  t.is(result, 'Content ID must be in UUID format', 'Should fail with a message');
});

test('Check content id-not object', t => {
  const result = utils.check.id({});
  t.is(typeof result, 'string', 'Wrong type id fails');
});

test('Check content id-not string', t => {
  const result = utils.check.id('foo');
  t.is(typeof result, 'string', 'ID not uuid fails');
});

test('Check content id-not just a number', t => {
  const result = utils.check.id(123);
  t.is(typeof result, 'string', 'ID not uuid fails');
});

test('Check content id - IS uuid', t => {
  const result = utils.check.id(uuid.v4());
  t.true(result, 'It should be in uuid');
});

//////////////////////////////
// Utils - revision check
//////////////////////////////
test('Check revision id-not blank', t => {
  const result = utils.check.revision(req);
  t.is(typeof result, 'string', 'Revision cannot be blank');
  t.is(result, 'Revision must be a number', 'Should fail with a message');
});
test('Check revision id-not number', t => {
  let result = utils.check.revision({});
  t.is(typeof result, 'string', 'Revision must be a number');
  result = utils.check.revision('foo');
  t.is(typeof result, 'string', 'Revision must be a number');
});

test('Check revision id-not string', t => {
  const result = utils.check.revision(123);
  t.true(result, 'Revision should be a number');
});

//////////////////////////////
// Utils - URL check
//////////////////////////////
test('URL checks type exists in CMS', t => {
  const rq = cloneDeep(req);
  rq.params.type = 'foo';
  const result = utils.check.url(rq, allTypes, allFlows);
  t.is(typeof result, 'string', 'Non-existent type fails');
  t.is(result, 'Content Type \'foo\' not found', 'Should fail with message');
});

test('URL checks type has existing workflow in CMS', t => {
  const rq = cloneDeep(req);
  const atypes = cloneDeep(allTypes);
  atypes[0].workflow = 'foo'
  const result = utils.check.url(rq, atypes, allFlows);

  t.is(typeof result, 'string', 'Non-existent workflow fails');
  t.is(result, 'Workflow \'foo\' for Content Type \'Services\' not found', 'Should fail with message');
});

test('URL checks id is uuid', t => {
  const rq = cloneDeep(req);
  rq.params.id = 'foo'
  const result = utils.check.url(rq, allTypes, allFlows);

  t.is(typeof result, 'string', 'Bad id-type fails');
  t.is(result, 'Content ID must be in UUID format', 'Should fail with message');
});

test('URL checks revision is number', t => {
  const rq = cloneDeep(req);
  rq.params.id = uuid.v4();
  rq.params.revision = 'foo';
  const result = utils.check.url(rq, allTypes, allFlows);

  t.is(typeof result, 'string', 'Bad revsion-type fails');
  t.is(result, 'Revision must be a number', 'Should fail with message');
});

test('URL works with CMS as it is configured', t => {
  const rq = cloneDeep(req);
  rq.params.id = uuid.v4();
  rq.params.revision = 123;

  const result = utils.check.url(rq, allTypes, allFlows);

  t.is(typeof result, 'object', 'Correct params returns an object');
  t.is(typeof result.type, 'object', 'Object contains type object');
  t.is(result.type.id, 'services', 'Type object contains merged content type');
  t.true(Array.isArray(result.type.attributes), 'Type object contains attribute array');
  t.true(result.type.attributes.length > 0, 'Attribute array contains attributes');
  t.is(typeof result.workflow, 'object', 'Object contains workflow object');
  t.is(result.workflow.id, 'editor-approve', 'Workflow object contains id');
  t.true(Array.isArray(result.workflow.steps), 'Workflow object contains steps array');
  t.true(result.workflow.steps.length > 0, 'Steps array contains steps');
  t.is(result.id, rq.params.id, 'Object contains content id');
  t.is(result.revision, rq.params.revision, 'Object contains content revision');
});
