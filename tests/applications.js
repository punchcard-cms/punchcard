import test from 'ava';
import events from 'events';
import httpMocks from 'node-mocks-http';
import _ from 'lodash';

import routes from '../lib/applications/routes';

const EventEmitter = events.EventEmitter;

//////////////////////////////
// Routes - Applications landing
//////////////////////////////
test.cb('All applications route', t => {
  const request = httpMocks.createRequest({
    method: 'GET',
    url: '/applications',
  });

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  routes.all(request, response);

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
  routes.add(request, response);

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
  routes.one(request, response);

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
  routes.save(request, response);

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(response.statusCode, 302, 'Should be a 302 response');
    t.is(response._getRedirectUrl(), '/applications');
    t.end();
  });
  response.render();
});
