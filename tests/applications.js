import test from 'ava';
import events from 'events';
import httpMocks from 'node-mocks-http';
import _ from 'lodash';

import applications from '../lib/applications';

const EventEmitter = events.EventEmitter;


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
test.cb('All applications route', t => {
  const request = httpMocks.createRequest({
    method: 'GET',
    url: '/applications',
  });

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  applications.routes.all(request, response);

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(response.statusCode, 200, 'Should be a 200 response');
    t.is(data.webhooks, 'all landing');
    t.end();
  });
  response.render();
});

//////////////////////////////
// Routes - New Application
//////////////////////////////
test.cb('New application route', t => {
  const request = httpMocks.createRequest({
    method: 'GET',
    url: '/applications/new',
  });

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  applications.routes.add(request, response);

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(response.statusCode, 200, 'Should be a 200 response');
    t.is(data.webhooks, 'new Webhook');
    t.end();
  });
  response.render();
});

//////////////////////////////
// Routes - Single application
//////////////////////////////
test.cb('Single application route', t => {
  const request = httpMocks.createRequest({
    method: 'GET',
    url: '/application/1234',
  });

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  applications.routes.one(request, response);

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(response.statusCode, 200, 'Should be a 200 response');
    t.is(data.webhooks, 'view Webhook');
    t.end();
  });
  response.render();
});

//////////////////////////////
// Routes - Save application
//////////////////////////////
test.cb('Save application route', t => {
  const request = httpMocks.createRequest({
    method: 'POST',
    url: '/application/save',
  });

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  applications.routes.save(request, response);

  response.on('end', () => {
    t.is(response.statusCode, 302, 'Should be a 302 response');
    t.is(response._getRedirectUrl(), '/applications');
    t.end();
  });
  response.render();
});
