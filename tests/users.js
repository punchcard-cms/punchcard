import test from 'ava';
import events from 'events';
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
      applications: {
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
  t.is(typeof users.model.create, 'function', '`create` exists and is a function');
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

test('Create users model merged with correct param', t => {
  return users.model.create()
    .then(result => {
      t.is(result[0].name, 'Create New User', 'Get users content type name');
      t.is(result[0].description, 'Create a new user', 'Get users content type desc');
      t.is(result[0].id, 'users-create', 'Get users content type id');
      t.is(result[0].attributes[1].name, 'Password', 'Password attribute name');
      t.is(result[0].attributes[1].id, 'password', 'Password attribute id');
      t.is(result[0].attributes[1].required, 'save', 'Password is required to save');
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
