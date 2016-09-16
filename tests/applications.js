import test from 'ava';
import events from 'events';
import httpMocks from 'node-mocks-http';
import _ from 'lodash';

import routes from '../lib/applications/routes';

const EventEmitter = events.EventEmitter;

//////////////////////////////
// Routes - All Content Types landing
//////////////////////////////
test.cb('All applications route', t => {
  const request = httpMocks.createRequest({
    method: 'GET',
    url: '/applications',
  });

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  routes.all(response);

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(response.statusCode, 200, 'Should be a 200 response');
    t.is(data.webhooks, 'all landing');
    t.end();
  });
  response.render();
});
