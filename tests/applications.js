import test from 'ava';
import events from 'events';
import httpMocks from 'node-mocks-http';
import config from 'config';
import _ from 'lodash';
import isInt from 'validator/lib/isInt';

import applications from '../lib/applications';
import database from '../lib/database';
import merged from './fixtures/applications/objects/model-merged.js';
import dbmocks from './fixtures/applications/objects/database-mocks.js';

const EventEmitter = events.EventEmitter;

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

/**
 * Form body response
 * @type {Object}
 */
const body = {
  'name--text': 'Bar',
  'live-endpoint--url': 'http://bar.com/live',
  'updated-endpoint--url': 'http://bar.com/updated',
  'sunset-endpoint--url': 'http://bar.com/sunset',
  'submit': 'save',
};

/**
 * Express Request Object
 * @type {Object}
 */
const reqObj = {
  method: 'GET',
  url: '/application',
  applications: {
    merged,
  },
  headers: {},
  params: {},
  session: {
    form: {
      applications: {
        save: {},
        edit: {},
      },
    },
  },
};

test.cb.before(t => {
  database.init().then(() => {
    database('applications').del().then(() => {
      database('applications').insert(dbmocks.rows).then(() => {
        t.end();
      });
    });
  }).catch(e => {
    t.fail(e.message);
  });
});

test('Applications functions', t => {
  t.is(typeof applications.model, 'function', '`model` exists and is a function');
  t.is(typeof applications.model.structure, 'object', '`structure` exists and is an object');
  t.is(typeof applications.routes, 'object', '`routes` exists and is an object');
  t.is(typeof applications.routes.all, 'function', '`all` exists and is a function');
  t.is(typeof applications.routes.add, 'function', '`new` exists and is a function');
  t.is(typeof applications.routes.one, 'function', '`one` exists and is a function');
  t.is(typeof applications.routes.secret, 'function', '`secret` exists and is a function');
  t.is(typeof applications.routes.save, 'function', '`save` exists and is a function');
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
  t.is(reqObj.applications.merged, merged, 'merged model is part of request object fixture');
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
test.cb.serial('All applications route', t => {
  const request = httpMocks.createRequest(reqObj);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  const resp = applications.routes.all(request, response);
  response.render();

  response.on('end', () => {
    const data = response._getRenderData();
    const app = data.applications.find((ap) => {
      return ap.name === 'Foo First Application';
    });

    t.is(response.statusCode, 200, 'Should be a 200 response');
    t.is(app.name, 'Foo First Application', 'includes form with inputs');

    t.is(_.get(app, 'responses.live[0].response', null), 200, 'includes live response');
    t.true(_.isDate(new Date(_.get(app, 'responses.live[0].timestamp', null))), 'includes live timestamp which is a date');
    t.is(_.get(app, 'responses.updated[0].response', null), 200, 'includes updated response');
    t.true(_.isDate(new Date(_.get(app, 'responses.updated[0].timestamp', null))), 'includes updated timestamp which is a date');
    t.is(_.get(app, 'responses.sunset[0].response', null), 200, 'includes sunset response');
    t.true(_.isDate(new Date(_.get(app, 'responses.sunset[0].timestamp', null))), 'includes sunset timestamp which is a date');

    return resp.then(res => {
      t.is(res, true, 'should return true');
      t.end();
    });
  });
});

//////////////////////////////
// Routes - New Application
//////////////////////////////
test.cb.serial('New application route', t => {
  const req = _.cloneDeep(reqObj);
  req.url = '/applications/add';

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  applications.routes.add(request, response);
  response.render();

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(response.statusCode, 200, 'Should be a 200 response');
    t.true(_.includes(data.form.html, 'name="sunset-endpoint--url"'), 'includes form with inputs');
    t.end();
  });
});

//////////////////////////////
// Routes - Single application
//////////////////////////////
test.cb.serial('Single application route', t => {
  const req = _.cloneDeep(reqObj);
  req.url = '/applications/1';
  req.params.id = 1;

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  const resp = applications.routes.one(request, response);
  response.render();

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(response.statusCode, 200, 'Should be a 200 response');

    // form is populated
    t.true(_.includes(data.form.html, 'value=\"Foo First Application\"'), 'includes form with name value');
    t.true(_.includes(data.form.html, 'value=\"http:/foo.com/live\"'), 'includes form with live-endpoint value');
    t.true(_.includes(data.form.html, 'value=\"http:/foo.com/updated\"'), 'includes form with updated-endpoint value');
    t.true(_.includes(data.form.html, 'value=\"http:/foo.com/sunset\"'), 'includes form with sunset-endpoint value');

    t.true(_.includes(data.action, '/applications/save'), 'includes `save` for form action');
    t.is(data.config.toString(), config.applications.toString(), 'includes config for applications');
    t.is(data.app.name, 'Foo First Application', 'includes data from database');
    t.is(data.button, 'update', 'includes `update` as text for button');

    return resp.then(res => {
      t.is(res, true, 'should return true');
      t.end();
    });
  });
});

test.cb.serial('Single application route - bad id', t => {
  const req = _.cloneDeep(reqObj);
  req.url = '/applications/1000';
  req.params.id = 1000;

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  const resp = applications.routes.one(request, response, next);

  response.on('end', () => {
    t.is(response.statusCode, 200, 'Should be a 200 response');

    return resp.then(res => {
      t.is(res.status, 404, 'should have 404 status');
      t.end();
    });
  });
  response.render();
});

test.cb.serial('Single application route - error on save', t => {
  const req = _.cloneDeep(reqObj);
  req.url = '/applications/3';
  req.params.id = 3;
  req.session.form.applications.edit.id = 3;
  req.session.form.applications.save.errors = {
    'name--text': 'Field is required to be saved!',
  };
  req.session.form.applications.save.content = {
    'name': { text: { value: '' } },
    'live-endpoint': { url: { value: 'http:/bar.com/live' } },
    'updated-endpoint': { url: { value: 'http:/bar.com/updated' } },
    'sunset-endpoint': { url: { value: 'http:/bar.com/sunset' } },
  };

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  applications.routes.one(request, response);
  response.render();

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(response.statusCode, 200, 'Should be a 200 response');

    // form shows error
    t.true(_.includes(data.form.html, 'class="required--save">Field is required to be saved!'), 'includes form with name value');

    t.end();
  });
});

//////////////////////////////
// Routes - Secret
//////////////////////////////
test.cb.serial('Create new secret', t => {
  const req = _.cloneDeep(reqObj);
  req.method = 'POST';
  req.headers.referrer = '/applications/1';
  req.session.form.applications.edit.id = 1;

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  const resp = applications.routes.secret(request, response, next);
  response.render();

  return response.on('end', () => {
    t.is(response.statusCode, 302, 'Should be a 302 response');
    t.is(response._getRedirectUrl(), '/applications/1', 'should redirect to edit url');

    return resp.then(res => {
      t.not(res, dbmocks.rows[0]['client-secret'], 'should be a new client secret');
      t.end();
    });
  });
});

test.cb.serial('Create new secret - bad id kills db', t => {
  const req = _.cloneDeep(reqObj);
  req.method = 'POST';
  req.headers.referrer = '/applications/break';
  req.session.form.applications.edit.id = 'break';

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  const resp = applications.routes.secret(request, response, next);

  resp.then(res => {
    t.true(_.includes(res.message, 'update "applications" set "client-secret"'), 'postgres error');
    t.end();
  });
});

test.cb.serial('Create new secret - bad referrer', t => {
  const req = _.cloneDeep(reqObj);
  req.method = 'POST';
  req.headers.referrer = '/applications/add';
  req.session.form.applications.edit.id = 1;

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  const resp = applications.routes.secret(request, response, next);

  if (resp.message) {
    t.is(resp.message, 'Secret can only be changed from the application edit screen', 'should error with message when bad referrer');
    t.is(resp.safe, '/applications', 'should error with safe url when bad referrer');
    t.is(resp.status, 500, 'should error with status message when bad referrer');
    t.end();
  }
  else {
    t.fail('should get secret warning message');
  }
});

//////////////////////////////
// Routes - Save application
//////////////////////////////
test.cb.serial('Save new app: name required', t => {
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

test.cb.serial('Save existing app: name required', t => {
  const req = _.cloneDeep(reqObj);
  req.method = 'POST';
  req.session.referrer = '/applications/123';
  req.url = '/applications/save';
  req.body = _.cloneDeep(body);
  req.body['name--text'] = '';

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  applications.routes.save(request, response);

  response.on('end', () => {
    t.is(response.statusCode, 302, 'Should be a 302 response');
    t.is(response._getRedirectUrl(), '/applications/123');
    t.end();
  });
  response.render();
});

test.cb.serial('Delete existing application', t => {
  const req = _.cloneDeep(reqObj);
  req.method = 'POST';
  req.session.referrer = '/applications/4';
  req.session.form.applications.edit.id = 4;
  req.url = '/applications/save';
  req.body = _.cloneDeep(body);
  req.body.submit = 'delete';

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  applications.routes.save(request, response);

  response.on('end', () => {
    t.is(response._getRedirectUrl(), '/applications');
    t.end();
  });
});

test.cb.serial('Update existing application', t => {
  const req = _.cloneDeep(reqObj);
  req.method = 'POST';
  req.session.referrer = '/applications/2';
  req.session.form.applications.edit.id = 2;
  req.url = '/applications/save';
  req.body = _.cloneDeep(body);
  req.body.submit = 'update';

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  applications.routes.save(request, response);

  response.on('end', () => {
    t.is(response._getRedirectUrl(), '/applications');
    t.end();
  });
});

test.cb.skip('Save new application', t => {
  const req = _.cloneDeep(reqObj);
  req.method = 'POST';
  req.session.referrer = '/applications/add';
  req.url = '/applications/save';
  req.body = _.cloneDeep(body);

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  const resp = applications.routes.save(request, response);

  response.on('end', () => {
    const redir = response._getRedirectUrl();
    const parts = redir.split('/');

    t.is(parts[1], 'applications', 'Should have applications base');
    t.true(isInt(parts[2]), 'Should have last application id');

    resp.then(() => {
      t.pass();
      t.end();
    });
  });
});
