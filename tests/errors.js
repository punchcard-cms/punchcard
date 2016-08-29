import test from 'ava';
import events from 'events';
import httpMocks from 'node-mocks-http';
import _ from 'lodash';

import routes from '../lib/errors/routes';

const EventEmitter = events.EventEmitter;

const get = (req) => {
  if (req === 'env') {
    return 'development';
  }

  return false;
};

// application fake object
const app = {
  get,
};

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

const err = {
  message: '',
  safe: '/content',
  status: 404,
};

//////////////////////////////
// Routes - 404
//////////////////////////////
test.cb('404 error route', t => {
  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  const request = httpMocks.createRequest({
    method: 'GET',
    url: '/some/madeup/icky/path',
  });

  request._setSessionVariable('404', {
    message: 'Something bad happened',
    safe: '/refreshing/safe/path',
  });

  routes.missing(request, response);

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(response.statusCode, 404, 'Should be a 404 response');
    t.is(data.message, 'Something bad happened');
    t.is(data.safe, '/refreshing/safe/path');
    t.end();
  });
  response.render();
});


//////////////////////////////
// Routes - error
//////////////////////////////
test.cb('General error', t => {
  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  const error = _.cloneDeep(err);
  const request = httpMocks.createRequest({
    method: 'GET',
    url: '/some/madeup/icky/path',
  });

  error.message = 'Something bad happened';
  error.safe = '/refreshing/safe/path';

  routes.errors(error, request, response, next, app);

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(response.statusCode, 404, 'Should be a 404 response');
    t.is(data.message, 'Something bad happened');
    t.is(data.safe, '/refreshing/safe/path');
    t.end();
  });
  response.render();
});

test.cb('Unknown error', t => {
  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  const request = httpMocks.createRequest({
    method: 'GET',
    url: '/some/madeup/icky/path',
  });

  routes.errors('', request, response, next, app);

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(response.statusCode, 500, 'Should be a 500 response');
    t.is(data.message, 'route error');
    t.is(data.safe, '/');
    t.end();
  });
  response.render();
});

test.cb('Message into error', t => {
  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  const request = httpMocks.createRequest({
    method: 'GET',
    url: '/some/madeup/icky/path',
  });

  routes.errors('I am error', request, response, next, app);

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(response.statusCode, 500, 'Should be a 500 response');
    t.is(data.message, 'I am error');
    t.is(data.safe, '/');
    t.end();
  });
  response.render();
});
