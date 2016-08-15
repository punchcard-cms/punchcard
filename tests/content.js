import test from 'ava';
import uuid from 'uuid';
import events from 'events';
import httpMocks from 'node-mocks-http';

import utils from '../lib/content/utils';
import routes from '../lib/content/routes';
import typesMock from './fixtures/types-post-merge';

const EventEmitter = events.EventEmitter;
let nextCalled;

/**
 * Express next mock
 */
const next = () => {
  nextCalled = true;

  return;
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
  const result = utils.check.id(req);
  t.false(result, 'Not in uuid');
});

test('Check content id-not object', t => {
  const rq = (JSON.parse(JSON.stringify(req)));
  rq.params.id = {};
  const result = utils.check.id(rq);
  t.false(result, 'Not in uuid');
});

test('Check content id-not string', t => {
  const rq = (JSON.parse(JSON.stringify(req)));
  rq.params.id = 'foo';
  const result = utils.check.id(rq);
  t.false(result, 'Not in uuid');
});

test('Check content id-not just a number', t => {
  const rq = (JSON.parse(JSON.stringify(req)));
  rq.params.id = 123;
  const result = utils.check.id(rq);
  t.false(result, 'Not in uuid');
});

test('Check content id - IS uuid', t => {
  const rq = (JSON.parse(JSON.stringify(req)));
  rq.params.id = uuid.v4();
  const result = utils.check.id(rq);
  t.true(result, 'It should be in uuid');
});

//////////////////////////////
// Utils - revision check
//////////////////////////////
test('Check revision id-not blank', t => {
  const result = utils.check.revision(req);
  t.false(result, 'Not blank');
});
test('Check revision id-not object', t => {
  const rq = (JSON.parse(JSON.stringify(req)));
  rq.params.id = {};
  const result = utils.check.revision(rq);
  t.false(result, 'Not an object');
});

test('Check revision id-not string', t => {
  const rq = (JSON.parse(JSON.stringify(req)));
  rq.params.id = 'foo';
  const result = utils.check.revision(rq);
  t.false(result, 'Not a string');
});

//////////////////////////////
// Utils - type check
//////////////////////////////
test('Check type exists', t => {
  const result = utils.check.type(req, null);
  t.false(result, 'Not blank');
});

test('Check type is object', t => {
  const result = utils.check.type(req, 'foo');
  t.false(result, 'Type should be an object');
});

test('Check type for name', t => {
  const typ = (JSON.parse(JSON.stringify(type)));
  typ.id = 'foo';
  const result = utils.check.type(req, typ);
  t.false(result, 'Should not allow blank type name');
});

test('Check type for id', t => {
  const typ = (JSON.parse(JSON.stringify(type)));
  typ.name = 'foo';
  const result = utils.check.type(req, typ);
  t.false(result, 'Should not allow blank type id');
});

test('Check accept a type object', t => {
  const typ = {
    name: 'foo',
    id: 'foo',
  };
  const result = utils.check.type(req, typ);
  t.true(result, 'Should be happy with a type object');
});

//////////////////////////////
// Routes - All Content Types landing
//////////////////////////////
test.cb('All content home route', t => {
  const request = httpMocks.createRequest({
    method: 'GET',
    url: '/content',
  });

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  routes.all(request, response, typesMock);

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(response.statusCode, 200, 'Should be a 200 response');
    t.is(data.content.home.title, 'All Content Types');
    t.is(data.content.base, 'content');
    t.is(data.content.types, typesMock);
    t.end();
  });
  response.render();
});

//////////////////////////////
// Routes - One content type's landing route
//////////////////////////////
test.cb('Bad single content landing route', t => {
  const request = httpMocks.createRequest({
    method: 'GET',
    url: '/content/foo',
    params: {
      type: 'foo',
    },
  });
  nextCalled = false;

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });

  routes.one(request, response, next, typesMock);

  t.true(nextCalled, 'Should call next');
  t.end();
});

test.cb('Working single content landing route', t => {
  const request = httpMocks.createRequest({
    method: 'GET',
    url: '/content/services',
    params: {
      type: 'services',
    },
  });
  nextCalled = false;

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });

  routes.one(request, response, next, typesMock);
  response.render();

  response.on('end', () => {
    const data = response._getRenderData();

    t.false(nextCalled, 'Should not call next');
    t.is(data.config.base, 'content', 'Should have content configuration');
    t.is(data.type, typesMock[0], 'Should discern content type\'s merged config');
    t.true(data.content.length > 0, 'Should have content');
    t.end();
  });
});

