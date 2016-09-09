import test from 'ava';
import request from 'supertest';
import punchcard from '../';

let agent;

test.cb.before(t => {
  punchcard().then(app => {
    agent = request.agent(app);

    t.end();
  });
});


test.cb('CMS Landing Page', t => {
  agent
    .get('/login')
    .expect(200)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.regex(res.text, /DOCTYPE html/, 'Should have an HTML Doctype');
      t.end();
    });
});
