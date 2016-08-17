import test from 'ava';
import events from 'events';
import httpMocks from 'node-mocks-http';
import _ from 'lodash';

import routes from '../lib/content/routes';
import typesMock from './fixtures/types-post-merge';
import allFlows from './fixtures/workflows/all-flows';

const references = [
  {
    type: 'test-reference',
    attr: 0,
    input: 'reference',
    ct: 'test-service',
  },
  {
    type: 'test-reference',
    attr: 1,
    input: 'reference',
    length: 1,
    ct: 'test-service',
  },
];

const EventEmitter = events.EventEmitter;

//////////////////////////////
// Routes - All Content Types landing
//////////////////////////////
test.cb('All content home route', t => {
  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  routes.all(response, typesMock);

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
test.cb('Working single content landing route', t => {
  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });

  routes.one(response, typesMock[0]);
  response.render();

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(data.config.base, 'content', 'Should have content configuration');
    t.is(data.type, typesMock[0], 'Should discern content type\'s merged config');
    t.true(Array.isArray(data.content), 'Content should be an array');
    t.end();
  });
});

//////////////////////////////
// Routes - One content type's add-content route
//////////////////////////////
test.cb('Content Add-new route - working route', t => {
  const request = httpMocks.createRequest({
    method: 'GET',
    url: '/content/services/add',
    params: {
      type: 'services',
    },
  });

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });

  routes.add(request, response, typesMock[0], allFlows[0], references, typesMock);
  response.render();

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(data.config.base, 'content', 'Should have content configuration');
    t.is(data.type, typesMock[0], 'Should discern content type\'s merged config');
    t.true(data.hasOwnProperty('form'), 'Has form data');
    t.true(data.form.hasOwnProperty('html'), 'Has form html');
    t.true(data.form.hasOwnProperty('scripts'), 'Has form scripts');
    t.true(_.includes(data.form.html, '<div id="service-name" class="form--field required--save">', 'has html form elements'));
    t.true(_.includes(data.form.scripts, '@module emailValidation', 'has form validation scripts'));
    t.is(data.step.name, 'Send to Legal', 'knows workflow step');

    t.end();
  });
});

test.cb('Content Add-new route - form has errors', t => {
  const errors = {
    'service-name--text': 'Field is required to be saved!',
    'service-email--email': 'Not a valid e-mail address.',
  };
  const values = {
    'service-name': {
      text: {
        value: 'New service Foo',
      },
    },
    'service-email': {
      email: {
        value: 'test',
      },
    },
  };
  const request = httpMocks.createRequest({
    method: 'GET',
    url: '/content/services/add',
    params: {
      type: 'services',
    },
  });

  request._setSessionVariable('form', {});

  _.set(request.session, 'form.content.add.services', {
    errors,
    content: values,
  });

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });

  routes.add(request, response, typesMock[0], allFlows[0], references, typesMock);
  response.render();

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(data.config.base, 'content', 'Should have content configuration');
    t.is(data.type, typesMock[0], 'Should discern content type\'s merged config');
    t.true(data.hasOwnProperty('form'), 'Has form data');
    t.true(data.form.hasOwnProperty('html'), 'Has form html');
    t.true(data.form.hasOwnProperty('scripts'), 'Has form scripts');
    t.true(_.includes(data.form.html, 'value="New service Foo"', 'has retained form data'));
    t.true(_.includes(data.form.html, 'name="service-email--email" aria-invalid="true" value="test"', 'has retained form data'));
    t.true(_.includes(data.form.html, 'Not a valid e-mail address.</p>', 'contains error message'));
    t.true(_.includes(data.form.scripts, '@module emailValidation', 'has form validation scripts'));
    t.is(data.step.name, 'Send to Legal', 'knows workflow step');

    t.end();
  });
});

