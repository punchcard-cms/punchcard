import test from 'ava';
import config from 'config';
import events from 'events';
import _ from 'lodash';
import httpMocks from 'node-mocks-http';

import application from './fixtures/app';
import database from '../lib/database';
import users from '../lib/users';
import userRoutes from '../lib/routes/users';
import merged from './fixtures/users/objects/model-merged.js';
import dbmocks from './fixtures/users/objects/database-mocks.js';

const EventEmitter = events.EventEmitter;
const next = application.next;

/**
 * Form body response
 * @type {Object}
 */
const body = {
  'email--email': dbmocks.rows[0].email,
  'role--select': dbmocks.rows[0].role,
  'password--password': dbmocks.rows[0].password,
  'submit': 'save',
};

/**
 * Express Request Object
 * @type {Object}
 */
const reqObj = application.request({
  url: '/users',
  app: {
    'users-model': merged,
  },
  session: {
    form: {
      users: {
        save: {},
        edit: {},
      },
    },
  },
});

//////////////////////////////
// Before/After test env setup
//////////////////////////////
test.cb.before(t => {
  database.init().then(() => {
    database('users').del().then(() => {
      database('users').insert(dbmocks.rows).then(() => {
        t.end();
      });
    });
  }).catch(e => {
    t.fail(e.stack);
  });
});

test.cb.after.always(t => {
  database('users').select('*').del().then(() => {
    t.end();
  }).catch(e => {
    t.fail(e.stack);
  });
});


//////////////////////////////
// Users Functions and Objects
//////////////////////////////
test('Users functions', t => {
  t.is(typeof userRoutes, 'function', 'Submodule `routes` exists and is a function');

  t.is(typeof users, 'object', 'main Users object');
  t.is(typeof users.model, 'function', 'Submodule `model`, is the primary for `users`, and is a function');
  t.is(typeof users.model.structure, 'object', '`structure` exists and is an object');
  t.true(Array.isArray(users.model.roles), '`roles` exists and is an array');
});

//////////////////////////////
// Users object structure
//////////////////////////////
test('Users structure object', t => {
  const structure = users.model.structure;

  t.is(typeof structure, 'object', 'Structure is an object');
  t.is(structure.name, 'Users', 'Structure has name');
  t.is(structure.description, 'An individual user', 'Structure has description');
  t.is(structure.id, 'users', 'Structure has id');
  t.true(Array.isArray(structure.attributes), 'attributes is an array');
});

//////////////////////////////
// Users merged data model
//////////////////////////////
test('Users, with config, merged with correct param', t => {
  const model = {
    'name': 'Users',
    'description': 'Test users description',
    'id': 'users',
    'identifier': 'email',
    'attributes': [
      {
        'type': 'email',
        'id': 'email',
        'name': 'Email',
        'description': 'Your email is your username',
      },
    ],
  };

  return users.model(model)
    .then(result => {
      t.is(result[0].name, 'Users', 'Get users content type name');
      t.is(result[0].description, 'Test users description', 'Get users content type desc');
      t.is(result[0].id, 'users', 'Get users content type id');
      t.is(result[0].attributes[0].name, 'Email', 'Email content type');
    });
});

test('Users merged with correct param', t => {
  return users.model()
    .then(result => {
      t.is(result[0].name, 'Users', 'Get users content type name');
      t.is(result[0].description, 'An individual user', 'Get users content type desc');
      t.is(result[0].id, 'users', 'Get users content type id');
      t.is(result[0].attributes[1].name, 'Password', 'Password attribute name');
      t.is(result[0].attributes[1].id, 'password', 'Password attribute id');
    });
});

//////////////////////////////
// Routes - Users landing
//////////////////////////////
test.cb('All Users route', t => {
  const request = httpMocks.createRequest(reqObj);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  users.routes.all(request, response, next);
  response.render();

  response.on('end', () => {
    const data = response._getRenderData();
    const user = data.users.find((usr) => {
      return usr.email === 'admin@test.com';
    });

    t.is(response.statusCode, 200, 'Should be a 200 response');
    t.is(data.title, 'users', 'includes page title');
    t.is(typeof data.config, 'object', 'includes users config');
    t.is(data.config.base, 'users', 'includes users base');
    t.is(user.email, 'admin@test.com', 'includes user email in data');
    t.is(user.password, 'pa55word', 'includes user password in data');

    t.end();
  });
});

//////////////////////////////
// Routes - New User
//////////////////////////////
test.cb('New user route', t => {
  const req = _.cloneDeep(reqObj);
  req.url = '/users/add';

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  users.routes.add(request, response);
  response.render();

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(response.statusCode, 200, 'Should be a 200 response');
    t.true(_.includes(data.form.html, 'name="email--email"'), 'includes form with inputs');
    t.end();
  });
});

//////////////////////////////
// Routes - Single user
//////////////////////////////
test.cb('Single user route', t => {
  const req = _.cloneDeep(reqObj);
  req.url = '/users/1';
  req.params.id = 1;

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  const resp = users.routes.one(request, response);
  response.render();

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(response.statusCode, 200, 'Should be a 200 response');

    // form is populated
    t.true(_.includes(data.form.html, 'value=\"admin@test.com\"'), 'includes form with email value');
    t.true(_.includes(data.form.html, 'value=\"admin\"'), 'includes form with role value');

    t.true(_.includes(data.action, '/users/save'), 'includes `save` for form action');
    t.is(data.config.toString(), config.users.toString(), 'includes config for users');
    t.is(data.button, 'update', 'includes `update` as text for button');

    return resp.then(res => {
      t.is(res, true, 'should return true');
      t.end();
    });
  });
});

test.cb('Single user route - bad id', t => {
  const req = _.cloneDeep(reqObj);
  req.url = '/users/1000';
  req.params.id = 1000;

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  const resp = users.routes.one(request, response, next);

  response.on('end', () => {
    t.is(response.statusCode, 200, 'Should be a 200 response');

    return resp.then(res => {
      t.is(res.status, 404, 'should have 404 status');
      t.end();
    });
  });
  response.render();
});

test.cb('Single user route - error on save', t => {
  const req = _.cloneDeep(reqObj);
  req.url = '/users/3';
  req.params.id = 3;
  req.session.form.users.edit.id = 3;
  req.session.form.users.save.errors = {
    'email--email': 'Field is required to be saved!',
  };
  req.session.form.users.save.content = {
    'email': { email: { value: '' } },
    'role': { select: { value: 'creator' } },
    'password': { password: { value: 'pa55word' } },
  };

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  users.routes.one(request, response);
  response.render();

  response.on('end', () => {
    const data = response._getRenderData();

    t.is(response.statusCode, 200, 'Should be a 200 response');

    // form shows error
    t.regex(data.form.html, /<p class="form--alert" role="alert" for="([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})">Field is required to be saved!<\/p>/g, 'includes form alert');

    t.end();
  });
});

//////////////////////////////
// Routes - Save user
//////////////////////////////
test.cb('Save new user: name required', t => {
  const req = _.cloneDeep(reqObj);
  req.method = 'POST';
  req.session.referrer = '/users/add';
  req.url = '/users/save';
  req.body = _.cloneDeep(body);
  req.body['email--email'] = '';

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  users.routes.save(request, response);

  response.on('end', () => {
    t.is(response.statusCode, 302, 'Should be a 302 response');
    t.is(response._getRedirectUrl(), '/users/add');
    t.end();
  });
  response.render();
});

test.cb('Save existing user: name required', t => {
  const req = _.cloneDeep(reqObj);
  req.method = 'POST';
  req.session.referrer = '/users/123';
  req.url = '/users/save';
  req.body = _.cloneDeep(body);
  req.body['email--email'] = '';

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  users.routes.save(request, response);

  response.on('end', () => {
    t.is(response.statusCode, 302, 'Should be a 302 response');
    t.is(response._getRedirectUrl(), '/users/123');
    t.end();
  });
  response.render();
});

test.cb('Delete existing user', t => {
  const req = _.cloneDeep(reqObj);
  req.method = 'POST';
  req.session.referrer = '/users/4';
  req.session.form.users.edit.id = 4;
  req.url = '/users/save';
  req.body = _.cloneDeep(body);
  req.body.submit = 'delete';

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  users.routes.save(request, response);

  response.on('end', () => {
    t.is(response._getRedirectUrl(), '/users');
    t.end();
  });
});

test.cb('Update existing user', t => {
  const req = _.cloneDeep(reqObj);
  req.method = 'POST';
  req.session.referrer = '/users/2';
  req.session.form.users.edit.id = 2;
  req.url = '/users/save';
  req.body = _.cloneDeep(body);
  req.body.submit = 'update';

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  users.routes.save(request, response);

  response.on('end', () => {
    t.is(response._getRedirectUrl(), '/users');
    t.end();
  });
});

test.cb('Save new user', t => {
  const req = _.cloneDeep(reqObj);
  req.method = 'POST';
  req.session.referrer = '/users/add';
  req.url = '/users/save';
  req.body = _.cloneDeep(body);

  const request = httpMocks.createRequest(req);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  users.routes.save(request, response);

  response.on('end', () => {
    t.is(response._getRedirectUrl(), '/users');
    t.end();
  });
});
