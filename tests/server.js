import test from 'ava';
import request from 'supertest';
import bcrypt from 'bcrypt-nodejs';
import Promise from 'bluebird';
import uuid from 'uuid';
import includes from 'lodash/includes';

import punchcard from '../';
import database from '../lib/database';

let agent;
let cookie;
const serviceUuid = uuid.v4();

let accounts = [
  {
    email: 'admin@test.com',
    password: 'pa55word',
    role: 'admin',
  },
  {
    email: 'creator@test.com',
    password: 'pa55word',
    role: 'creator',
  },
];

const getUser = (usr) => {
  return database.select('*').from('users').where({
    email: usr.email,
  });
};

const userCheck = (usr) => {
  return getUser(usr).then(user => {
    if (user.length < 1) {
      return database('users').insert({
        email: usr.email,
        password: bcrypt.hashSync(usr.password),
        role: usr.role,
      });
    }

    return [];
  });
};

const service = [
  {
    id: serviceUuid,
    language: 'test-dummy-entry',
    publishable: false,
    approval: 1,
    value: {},
  },
];

const getService = (svc) => {
  return database.select('*').from('content-type--services').where({
    id: svc.id,
  });
};

const serviceCheck = (svc) => {
  return getService(svc).then(srvc => {
    if (srvc.length < 1) {
      return database('content-type--services').insert(svc);
    }

    return [];
  });
};

const deleteService = () => {
  return database('content-type--services').where('language', '=', 'test-dummy-entry').del();
};

// cue up our application for all tests
test.cb.before((t) => {
  punchcard().then(app => {
    agent = request.agent(app);

    return Promise.map(service, serviceCheck);
  }).then(() => {
    return Promise.map(accounts, userCheck);
  }).then(() => {
    return Promise.map(accounts, getUser);
  }).then((users) => {
    accounts = accounts.map(account => {
      const act = account;
      const usr = users.filter(user => {
        if (user[0].email === account.email) {
          return true;
        }

        return false;
      })[0][0];

      act.id = usr.id;

      return act;
    });

    agent.post('/login')
      .send({
        email: accounts[0].email,
        password: accounts[0].password,
        provider: 'local',
      })
      .expect('set-cookie', /connect.sid/)
      .expect(302)
      .expect('location', '/')
      .end((err, res) => { // eslint-disable-line
        if (err) throw err;

        cookie = res.headers['set-cookie'];
        t.end();
      });
  });
});

test.cb.after((t) => {
  punchcard().then(() => {
    return deleteService();
  }).then(() => {
    t.end();
  });
});

test.cb('CMS Landing Page', t => {
  agent
    .get('/')
    .set('cookie', cookie)
    .expect(200)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');
      t.end();
    });
});

//////////////////////////////
// Content Pages
//////////////////////////////
test.cb('Content Landing Page', t => {
  agent
    .get('/content')
    .set('cookie', cookie)
    .expect(200)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

      t.end();
    });
});

test.cb('Content Type Landing Page', t => {
  agent
    .get('/content/services')
    .set('cookie', cookie)
    .expect(200)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

      t.end();
    });
});

test.cb('Invalid Content Type - Landing', t => {
  agent
    .get('/content/foo')
    .set('cookie', cookie)
    .expect(404)
    .end(err => {
      t.is(err, null, 'Should not have an error');
      t.end();
    });
});

test.cb('Content Type Add Page', t => {
  agent
    .get('/content/services/add')
    .set('cookie', cookie)
    .expect(200)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

      // eslint disable: quotes are part of what we're checking form
      t.true(includes(res.text, `<button type="submit" class="base--button">Editor Approval</button>`, 'Approval button text')); // eslint-disable-line quotes

      t.end();
    });
});

test.cb('Invalid Content Type - Add', t => {
  agent
    .get('/content/foo/add')
    .set('cookie', cookie)
    .expect(404)
    .end(err => {
      t.is(err, null, 'Should not have an error');
      t.end();
    });
});

test.cb('Content Type Edit Page', t => {
  getService({ id: serviceUuid }).then(srvc => {
    agent
      .get(`/content/services/${srvc[0].revision}/edit`)
      .set('cookie', cookie)
      .expect(200)
      .end((err, res) => {
        t.is(err, null, 'Should not have an error');
        t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

        // eslint disable: quotes are part of what we're checking form
        t.true(includes(res.text, `<button type="submit" class="base--button">Editor Approval</button>`, 'Approval button text')); // eslint-disable-line quotes

        t.end();
      });
  });
});

test.cb('Invalid Content Type - Edit', t => {
  getService({ id: serviceUuid }).then(srvc => {
    agent
      .get(`/content/foo/${srvc[0].revision}/edit`)
      .set('cookie', cookie)
      .expect(404)
      .end(err => {
        t.is(err, null, 'Should have an error');
        t.end();
      });
  });
});

test.cb('Content Type Approval Page', t => {
  getService({ id: serviceUuid }).then(srvc => {
    agent
      .get(`/content/services/${srvc[0].revision}/approve`)
      .set('cookie', cookie)
      .expect(200)
      .end((err, res) => {
        t.is(err, null, 'Should not have an error');
        t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

        t.end();
      });
  });
});

test.cb('Format of Revision ID - Approval', t => {
  agent
    .get('/content/services/foo/approve')
    .buffer(true)
    .set('cookie', cookie)
    .expect(404)
    .end((err, res) => {
      t.is(err, null, 'Should have an error');
      t.true(includes(res.text, 'Revision must be a number', 'Revision must be a number'));
      t.end();
    });
});

test.cb('Bad Revision ID - Approval', t => {
  getService({ id: serviceUuid })
  .orderBy('revision', 'DESC')
  .then(srvc => {
    const bad = srvc[0].revision * 1000;
    agent
      .get(`/content/services/${bad}/approve`)
      .set('cookie', cookie)
      .expect(404)
      .end((err, res) => {
        t.is(err, null, 'Should have an error');
        t.true(includes(res.text, `Revision &#39;${bad}&#39; in Content Type &#39;services&#39; not found`, 'Revision id not in system'));
        t.end();
      });
  });
});

test.cb('Content Type Post data', t => {
  agent
    .post('/content/services/save')
    .field('language', 'test-dummy-entry')
    .set('cookie', cookie)
    .expect(302)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.is(res.text, 'Found. Redirecting to /content/services', 'should have a redirect message');

      t.end();
    });
});

test.cb('Invalid Content Type - Post data', t => {
  agent
    .post('/content/foo/save')
    .field('id', serviceUuid)
    .set('cookie', cookie)
    .expect(404)
    .end(err => {
      t.is(err, null, 'Should have an error');
      t.end();
    });
});

//////////////////////////////
// 404 Pages
//////////////////////////////
test.cb('404 Page', t => {
  agent
    .get('/foo')
    .set('cookie', cookie)
    .expect(404)
    .end(err => {
      t.is(err, null, 'Should not have an error');
      t.end();
    });
});

//////////////////////////////
// User Pages
//////////////////////////////
test.cb('Users Landing Page', t => {
  agent
    .get('/users')
    .set('cookie', cookie)
    .expect(200)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

      t.end();
    });
});

test.cb('Users Add Landing Page', t => {
  agent
    .get('/users/add')
    .set('cookie', cookie)
    .expect(200)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

      t.end();
    });
});

test.cb('Users Edit Landing Page', t => {
  agent
    .get(`/users/${accounts[1].id}/edit`)
    .set('cookie', cookie)
    .expect(200)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

      t.end();
    });
});

test.cb('Users Delete Landing Page', t => {
  agent
    .get(`/users/${accounts[1].id}/delete`)
    .set('cookie', cookie)
    .expect(200)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

      t.end();
    });
});
