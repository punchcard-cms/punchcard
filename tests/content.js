import test from 'ava';
import uuid from 'uuid';
import utils from '../lib/content/utils';

const config = {
  content: {
    messages: {
      content: {
        title: 'Revisions for \'%id\'',
      },
      format: {
        id: 'Content ID must be in UUID format',
        revision: 'Revision must be a number',
      },
      missing: {
        type: 'Content Type \'%type\' not found',
        id: 'Content with ID \'%id\' in Content Type \'%type\' not found',
        revision: 'Revision \'%revision\' for ID \'%id\' in Content Type \'%type\' not found',
      },
      revisions: {
        title: 'Revision \'%revision\' for \'%id\'',
      },
    },
  },
};

const req = {
  params: {
    id: '',
    revision: '',
  },
  session: {},
};

const type = {
  name: '',
  id: '',
};


//////////////////////////////
// Utils - id check
//////////////////////////////
test('Check content id-not blank', t => {
  const result = utils.check.id(config, req);
  t.false(result, 'Not in uuid');
});

test('Check content id-not object', t => {
  const rq = (JSON.parse(JSON.stringify(req)));
  rq.params.id = {};
  const result = utils.check.id(config, rq);
  t.false(result, 'Not in uuid');
});

test('Check content id-not string', t => {
  const rq = (JSON.parse(JSON.stringify(req)));
  rq.params.id = 'foo';
  const result = utils.check.id(config, rq);
  t.false(result, 'Not in uuid');
});

test('Check content id-not just a number', t => {
  const rq = (JSON.parse(JSON.stringify(req)));
  rq.params.id = 123;
  const result = utils.check.id(config, rq);
  t.false(result, 'Not in uuid');
});

test('Check content id - IS uuid', t => {
  const rq = (JSON.parse(JSON.stringify(req)));
  rq.params.id = uuid.v4();
  const result = utils.check.id(config, rq);
  t.true(result, 'It should be in uuid');
});

//////////////////////////////
// Utils - revision check
//////////////////////////////
test('Check revision id-not blank', t => {
  const result = utils.check.revision(config, req);
  t.false(result, 'Not blank');
});
test('Check revision id-not object', t => {
  const rq = (JSON.parse(JSON.stringify(req)));
  rq.params.id = {};
  const result = utils.check.revision(config, rq);
  t.false(result, 'Not an object');
});

test('Check revision id-not string', t => {
  const rq = (JSON.parse(JSON.stringify(req)));
  rq.params.id = 'foo';
  const result = utils.check.revision(config, rq);
  t.false(result, 'Not a string');
});

//////////////////////////////
// Utils - type check
//////////////////////////////
test('Check type exists', t => {
  const result = utils.check.type(config, req, null);
  t.false(result, 'Not blank');
});

test('Check type is object', t => {
  const result = utils.check.type(config, req, 'foo');
  t.false(result, 'Type should be an object');
});

test('Check type for name', t => {
  const typ = (JSON.parse(JSON.stringify(type)));
  typ.id = 'foo';
  const result = utils.check.type(config, req, typ);
  t.false(result, 'Should not allow blank type name');
});

test('Check type for id', t => {
  const typ = (JSON.parse(JSON.stringify(type)));
  typ.name = 'foo';
  const result = utils.check.type(config, req, typ);
  t.false(result, 'Should not allow blank type id');
});

test('Check accept a type object', t => {
  const typ = {
    name: 'foo',
    id: 'foo',
  };
  const result = utils.check.type(config, req, typ);
  t.true(result, 'Should be happy with a type object');
});
