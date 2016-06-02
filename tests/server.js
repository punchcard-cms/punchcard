import test from 'ava';
import request from 'supertest';
import bcrypt from 'bcrypt-nodejs';
import Promise from 'bluebird';

import punchcard from '../';
import database from '../lib/database';

let agent;
let cookie;

const accounts = [
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

const userCheck = (usr) => {
  return database.select('*').from('users').where({
    email: usr.email,
  }).then(user => {
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

// cue up our application for all tests
test.cb.before((t) => {
  punchcard().then(app => {
    agent = request.agent(app);

    return Promise.map(accounts, userCheck);
  }).then(() => {
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
    .expect(404)
    .end(err => {
      t.is(err, null, 'Should not have an error');
      t.end();
    });
});

test.cb('Content Type Add Page', t => {
  agent
    .get('/content/services/add')
    .expect(200)
    .end((err, res) => {
      if (err) {
        t.fail(err);
      }

      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

      t.end();
    });
});

test.cb('Invalid Content Type - Add', t => {
  agent
    .get('/content/foo/add')
    .expect(404)
    .end(err => {
      t.is(err, null, 'Should not have an error');
      t.end();
    });
});

test.cb('404 Page', t => {
  agent
    .get('/foo')
    .expect(404)
    .end(err => {
      t.is(err, null, 'Should not have an error');
      t.end();
    });
});
