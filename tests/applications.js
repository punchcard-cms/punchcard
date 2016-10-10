import test from 'ava';
import events from 'events';
import httpMocks from 'node-mocks-http';
import moment from 'moment';
import nock from 'nock';
import config from 'config';
import _ from 'lodash';
import isInt from 'validator/lib/isInt';

import applications from '../lib/applications';
import init from '../lib/applications/init';
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
 * appget
 *
 * @param {string} find - value to search for
 *
 * @returns {varies} whatever the search gives back
 */
const appget = (find) => {
  // here to mimic application functions until this pr is complete: https://github.com/howardabrams/node-mocks-http/pull/107
  return reqObj.app[find]; // eslint-disable-line no-use-before-define
};

/**
 * appset
 *
 * @param {string} find - value to search for
 * @param {varies} changed - new value to replace with
 */
const appset = (find, changed) => {
  // here to mimic application functions until this pr is complete: https://github.com/howardabrams/node-mocks-http/pull/107
  reqObj.app[find] = changed; // eslint-disable-line no-use-before-define
};

/**
 * Express Request Object
 * @type {Object}
 *
 * eslint note: quote-props required because app.settings cannot call sub-objects
 */
const reqObj = {
  method: 'GET',
  url: '/application',
  app: { // eslint-disable-line quote-props
    get: appget,
    set: appset,
    'applications-apps': dbmocks.rows,
    'applications-merged': merged,
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

/**
 * Request options
 * @type {Object}
 */
const reqOptions = {
  url: 'https://punchcard.io',
  method: 'POST',
  json: {
    id: 1234,
    secret: 5678,
  },
};

// set up nock locations from data
dbmocks.rows.forEach(app => {
  const endpoints = ['live', 'updated', 'sunset'];
  endpoints.forEach(endpoint => {
    if (app[`${endpoint}-endpoint`]) {
      nock(app[`${endpoint}-endpoint`])
       .post('')
       .reply(200);
    }
  });
});

test.cb.before(t => {
  database.init().then(() => {
    database('applications').del().then(() => {
      database('applications').insert(dbmocks.rows).then(() => {
        // auto-increment set past added entries
        database.schema.raw('select setval(\'applications_id_seq\', 20, true)').then(() => {
          t.end();
        });
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
  t.is(typeof applications.send.endpoints, 'function', '`send` exists and is a function');
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
  t.is(reqObj.app['applications-merged'], merged, 'merged model is part of request object fixture');
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
// Applications init
//////////////////////////////
test('Grab applications model-merged and all apps', t => {
  return init().then(result => {
    t.is(typeof result, 'object', 'Returns an object');
    t.is(typeof result.merged, 'object', 'Returns merged object');
    t.true(Array.isArray(result.apps), 'Returns applications in an array');
    t.is(result.apps.length, 5, 'has five applications');
  });
});

//////////////////////////////
// Send: endpoints
//////////////////////////////
test('Endpoint Request options', t => {
  const options = {
    trigger: 'live',
    apps: dbmocks.rows,
  };

  return applications.send.endpoints(options).then(res => {
    t.true(Array.isArray(res.endpoints), 'Should return an array');
    t.is(res.endpoints.length, 4, 'Should return four objects because id:2 has no `live` endpoint');

    const point = dbmocks.rows.find((end) => {
      return end.id === 1;
    });
    const app = res.endpoints.find((ap) => {
      return ap.id === 1;
    });

    t.is(app.id, 1, 'Should be first app');
    t.is(_.get(app, 'options.url', null), 'http://foo.com/live', 'includes live endpoint');
    t.is(_.get(app, 'options.method', null), 'POST', 'includes method');
    t.is(_.get(app, 'options.json.id', null), point['client-id'], 'includes client id');
    t.is(_.get(app, 'options.json.secret', null), point['client-secret'], 'includes client secret');
  });
});

test('Endpoint Request options', t => {
  const options = {
    trigger: 'live',
    apps: null,
  };

  return applications.send.endpoints(options).catch(err => {
    t.is(err, 'Apps must be an array', 'Should require apps to be an array');
  });
});

//////////////////////////////
// Send: request
//////////////////////////////
test('Request wrapper - good', t => {
  nock('https://punchcard.io')
   .post('/')
   .reply(200);

  return applications.send.request(reqOptions).then(res => {
    t.is(typeof res, 'object', 'Should return an object');
    t.is(res.response, 200, 'Should return 200 status');
    t.true(_.isDate(new Date(res.timestamp)), 'includes a timestamp which is a date');
  });
});

test('Request wrapper - bad', t => {
  const badOptions = _.cloneDeep(reqOptions);
  badOptions.url = 'https://punchcard.io/bad';

  nock('https://punchcard.io')
   .post('/bad')
   .reply(500);

  return applications.send.request(badOptions).then(res => {
    t.is(typeof res, 'object', 'Should return an object');
    t.is(res.response, 500, 'Should return 500 status');
    t.true(_.isDate(new Date(res.timestamp)), 'includes a timestamp which is a date');
  });
});

//////////////////////////////
// Send: save
//////////////////////////////
test('Save responses to DB', t => {
  const response = {
    response: 200,
    timestamp: moment().unix(),
  };
  const options = {
    trigger: 'live',
    apps: dbmocks.rows,
    endpoints: [
      {
        id: 1,
        options: reqOptions,
        response,
      },
      {
        id: 2,
        options: reqOptions,
        response,
      },
    ],
  };

  return applications.send.save(options).then(res => {
    const app = res[0][0];

    t.true(Array.isArray(res), 'Should return an array');
    t.true(Array.isArray(app.responses.live), 'includes live responses, which is an array');
    t.is(app.responses.live[0].response, 200, 'includes endpoint response');
  });
});

test('Save responses to DB when zero responses', t => {
  const response = {
    response: 200,
    timestamp: moment().unix(),
  };
  const options = {
    trigger: 'live',
    apps: dbmocks.rows,
    endpoints: [
      {
        id: 3,
        options: reqOptions,
        response,
      },
    ],
  };

  return applications.send.save(options).then(res => {
    const app = res.find(ap => {
      return ap[0].name === 'Bar Third Application';
    });

    t.true(Array.isArray(res), 'Should return an array');
    t.true(Array.isArray(app[0].responses.live), 'includes live responses, which is an array');
    t.is(app[0].responses.live[app[0].responses.live.length - 1].response, 200, 'includes endpoint response');
  });
});

//////////////////////////////
// Send: SEND
//////////////////////////////
test('Send', t => {
  const options = {
    trigger: 'live',
    apps: dbmocks.rows,
  };

  return applications.send(options).then(res => {
    const app = res[0][0];

    t.true(Array.isArray(res), 'Should return an array');

    t.true(Array.isArray(app.responses.live), 'includes live responses, which is an array');
    t.is(app.responses.live[app.responses.live.length - 1].response, 200, 'includes endpoint response');
  });
});

test('Send - sunset', t => {
  const options = {
    trigger: 'sunset',
    apps: dbmocks.rows,
  };

  return applications.send(options).then(res => {
    const app = res.map(ap => {
      return ap[0];
    }).find((ap) => {
      return ap.name === 'Foo First Application';
    });

    t.true(Array.isArray(res), 'Should return an array');
    t.true(Array.isArray(app.responses.sunset), 'includes live responses, which is an array');
    t.is(app.responses.sunset[0].response, 200, 'includes endpoint response');
  });
});

test('Send - bad urls', t => {
  const rows = dbmocks.rows;
  const bad = rows.map(rw => {
    const row = rw;
    row['sunset-endpoint'] = 'http://a bad url.com';

    return row;
  });
  const options = {
    trigger: 'sunset',
    apps: bad,
  };

  return applications.send(options).then(res => {
    const app = res.map(ap => {
      return ap[0];
    }).find((ap) => {
      return ap.name === 'Foo First Application';
    });

    t.true(Array.isArray(res), 'Should return an array');

    t.true(Array.isArray(app.responses.sunset), 'includes live responses, which is an array');
    t.is(app.responses.sunset[0].response, 404, 'includes endpoint response');
  });
});

//////////////////////////////
// Routes - Applications landing
//////////////////////////////
test.cb('All applications route', t => {
  const request = httpMocks.createRequest(reqObj);

  const response = httpMocks.createResponse({ eventEmitter: EventEmitter });
  applications.routes.all(request, response);
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

    t.end();
  });
  response.end();
});

//////////////////////////////
// Routes - New Application
//////////////////////////////
test.cb('New application route', t => {
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
    t.true(_.includes(data.form.html, 'value=\"http://foo.com/live\"'), 'includes form with live-endpoint value');
    t.true(_.includes(data.form.html, 'value=\"http://foo.com/updated\"'), 'includes form with updated-endpoint value');
    t.true(_.includes(data.form.html, 'value=\"http://foo.com/sunset\"'), 'includes form with sunset-endpoint value');

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
    'live-endpoint': { url: { value: 'http://bar.com/live' } },
    'updated-endpoint': { url: { value: 'http://bar.com/updated' } },
    'sunset-endpoint': { url: { value: 'http://bar.com/sunset' } },
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
test.cb('Create new secret', t => {
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

test.cb('Create new secret - bad id kills db', t => {
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

test.cb('Create new secret - bad referrer', t => {
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

test.cb('Delete existing application', t => {
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

  response.on('end', () => {
    t.is(response._getRedirectUrl(), '/applications');
    t.end();
  });
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

  response.on('end', () => {
    const redir = response._getRedirectUrl();
    const parts = redir.split('/');

    t.is(parts[1], 'applications', 'Should have applications base');
    t.true(isInt(parts[2]), 'Should have last application id');

    t.end();
  });
});
