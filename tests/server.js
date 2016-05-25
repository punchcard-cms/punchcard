import test from 'ava';
import request from 'supertest';
import punchcard from '../';

// cue up our application for all tests
test.beforeEach((t) => {
  return punchcard().then(app => {
    // Ignoring this param reassign as it's the standard for AVA to allow users to assign context to the tests
    t.context.request = request(app); // eslint-disable-line no-param-reassign

    return app;
  });
});

test.cb.skip('CMS Landing Page', t => {
  t.context.request
    .get('/')
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.is(res.status, 200, 'should return status 200');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');
      t.end();
    });
});

test.cb('CMS Landing Page', t => {
  t.context.request
    .get('/')
    .end((err, res) => {
      t.is(err, null, 'Should have an error');
      t.is(res.status, 302, 'should return status 302');
      t.is(res.text, 'Found. Redirecting to /login', 'should redirect');
      t.end();
    });
});
