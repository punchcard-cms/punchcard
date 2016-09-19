import test from 'ava';
import events from 'events';
import httpMocks from 'node-mocks-http';
import _ from 'lodash';

import applications from '../lib/applications';
import merged from './fixtures/applications/model-merged.js';

const EventEmitter = events.EventEmitter;

const body = {
  'name--text': 'Foo',
  'live-endpoint--text': 'http://foo.com/live',
  'updated-endpoint--text': 'http://foo.com/updated',
  'sunset-endpoint--text': 'http://foo.com/sunset',
  'client-id--text': 'bar-client',
  'client-secret--text': 'bar-secret',
  'submit': 'save',
};

const reqObj = {
  method: 'GET',
  url: '/application',
  applications: {
    merged,
  },
  session: {},
};


test('Applications functions', t => {
  t.is(typeof applications.routes, 'object', '`routes` exists and is an object');
  t.is(typeof applications.routes.all, 'function', '`all` exists and is a function');
  t.is(typeof applications.routes.add, 'function', '`new` exists and is a function');
  t.is(typeof applications.routes.one, 'function', '`one` exists and is a function');
  t.is(typeof applications.routes.save, 'function', '`save` exists and is a function');
  t.is(typeof applications.model, 'function', '`model` exists and is a function');
  t.is(typeof applications.model.structure, 'object', '`structure` exists and is an object');
});

//////////////////////////////
// Applications object structure
//////////////////////////////
test('Applications structure object', t => {
  const structure = applications.model.structure;

  t.is(typeof structure, 'object', 'Structure is an object');
  t.is(structure.name, 'Applications', 'Structure has name');
  t.is(structure.description, 'Contains webhook applications', 'Structure has description');
  t.is(structure.id, 'applications', 'Structure has id');
  t.true(Array.isArray(structure.attributes), 'attributes is an array');
});

//////////////////////////////
// Applications - model
//////////////////////////////
test('Applications model', t => {
  return applications.model().then(model => {
    t.true(model[0].hasOwnProperty('name'), 'Should have a workflow attribute');
    t.is(model[0].name, 'Applications', 'Structure has name');
  });
});

test('Workflow model from config', t => {
  const structure = _.cloneDeep(applications.model.structure);
  structure.name = 'Other';

  return applications.model(structure).then(model => {
    t.true(model[0].hasOwnProperty('name'), 'Should have a workflow attribute');
    t.is(model[0].name, 'Other', 'Structure has name');
  });
});

//////////////////////////////
// Routes - Applications landing
//////////////////////////////
test.cb.skip('All applications route', t => {
  const request = httpMocks.createRequest(reqObj);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  applications.routes.all(request, response);

  // response.on('end', () => {
  //   const data = response._getRenderData();

  //   t.is(response.statusCode, 200, 'Should be a 200 response');
  //   t.end();
  // });
  // response.render();
});

//////////////////////////////
// Routes - New Application
//////////////////////////////
test.cb('New application route', t => {
  const req = _.cloneDeep(reqObj);
  req.url = '/applications/new';

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  applications.routes.add(request, response);
  response.render();

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(response.statusCode, 200, 'Should be a 200 response');
    t.true(_.includes(data.form.html, 'name="sunset-endpoint--text"'), 'includes form with inputs');
    t.end();
  });
});

//////////////////////////////
// Routes - Single application
//////////////////////////////
test.cb.skip('Single application route', t => {
  const req = _.cloneDeep(reqObj);
  req.url = '/applications/1234';

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  applications.routes.one(request, response);

  // response.on('end', () => {
  //   const data = response._getRenderData();

  //   t.is(response.statusCode, 200, 'Should be a 200 response');
  //   t.is(data.webhooks, 'view Webhook');
  //   t.end();
  // });
  // response.render();
});

//////////////////////////////
// Routes - Save application
//////////////////////////////
test.cb('Save app: name required', t => {
  const req = _.cloneDeep(reqObj);
  req.method = 'POST';
  req.session.referrer = '/applications/add';
  req.url = '/applications/save';
  req.body = _.cloneDeep(body);
  req.body['name--text'] = '';

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  applications.routes.save(request, response);

  response.on('end', () => {
    t.is(response.statusCode, 302, 'Should be a 302 response');
    t.is(response._getRedirectUrl(), '/applications/add');
    t.end();
  });
  response.render();
});

test.cb('Save application route', t => {
  const req = _.cloneDeep(reqObj);
  req.method = 'POST';
  req.url = '/applications/save';
  req.body = body;

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  applications.routes.save(request, response);
  response.render();

  response.on('end', () => {
    t.is(response.statusCode, 302, 'Should be a 302 response');
    t.is(response._getRedirectUrl(), '/applications');
    t.end();
  });
});
