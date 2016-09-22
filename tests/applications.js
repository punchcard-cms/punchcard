import test from 'ava';
import events from 'events';
import httpMocks from 'node-mocks-http';
import config from 'config';
import _ from 'lodash';

import applications from '../lib/applications';
import database from '../lib/database';
import merged from './fixtures/applications/objects/model-merged.js';

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

const body = {
  'name--text': 'Bar',
  'live-endpoint--url': 'http://bar.com/live',
  'updated-endpoint--url': 'http://bar.com/updated',
  'sunset-endpoint--url': 'http://bar.com/sunset',
  'submit': 'save',
};

const reqObj = {
  method: 'GET',
  url: '/application',
  applications: {
    merged,
  },
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

const inserts = [
  {
    'id': 1,
    'name': 'Foo First Application',
    'live-endpoint': 'http:/foo.com/live',
    'updated-endpoint': 'http:/foo.com/updated',
    'sunset-endpoint': 'http:/foo.com/sunset',
  },
  {
    'id': 2,
    'name': 'Baz Second Application',
    'live-endpoint': 'http:/baz.com/live',
    'updated-endpoint': 'http:/baz.com/updated',
    'sunset-endpoint': 'http:/baz.com/sunset',
  },
  {
    'id': 3,
    'name': 'Bar Third Application',
    'live-endpoint': 'http:/bar.com/live',
    'updated-endpoint': 'http:/bar.com/updated',
    'sunset-endpoint': 'http:/bar.com/sunset',
  },
];

test.cb.before(t => {
  database.init().then(() => {
    database(`${config.applications.base}`).del().then(() => {
      database(`${config.applications.base}`).insert(inserts).then(() => {
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
test.cb('All applications route', t => {
  const request = httpMocks.createRequest(reqObj);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  const resp = applications.routes.all(request, response);
  response.render();

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(response.statusCode, 200, 'Should be a 200 response');
    t.is(data.applications[0].name, 'Foo First Application', 'includes form with inputs');
    t.is(data.applications[1].name, 'Baz Second Application', 'includes form with inputs');

    return resp.then(res => {
      t.is(res, true, 'should return true');
      t.end();
    });
  });
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
    t.true(_.includes(data.form.html, 'name="sunset-endpoint--url"'), 'includes form with inputs');
    t.end();
  });
});

//////////////////////////////
// Routes - Single application
//////////////////////////////
test.cb('Single application route', t => {
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
    t.is(data.data.name.text.value, 'Foo First Application', 'includes data from database');
    t.is(data.button, 'update', 'includes `update` as text for button');

    return resp.then(res => {
      t.is(res, true, 'should return true');
      t.end();
    });
  });
});

test.cb('Single application route - bad id', t => {
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

test.cb('Single application route - error on save', t => {
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
// Routes - Save application
//////////////////////////////
test.cb('Save new app: name required', t => {
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

test.cb('Save existing app: name required', t => {
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

test.cb('Save new application', t => {
  const req = _.cloneDeep(reqObj);
  req.method = 'POST';
  req.session.referrer = '/applications/add';
  req.url = '/applications/save';
  req.body = _.cloneDeep(body);

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

test.cb('Update existing application', t => {
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
  response.render();

  response.on('end', () => {
    t.is(response.statusCode, 302, 'Should be a 302 response');
    t.is(response._getRedirectUrl(), '/applications');
    t.end();
  });
});
