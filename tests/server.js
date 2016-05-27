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

test.cb.skip('Content Landing Page', t => {
  t.context.request
    .get('/content')
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.is(res.status, 200, 'should return status 200');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');
      t.end();
    });
});

test.cb.skip('Content Type Landing Page', t => {
  t.context.request
    .get('/content/services')
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.is(res.status, 200, 'should return status 200');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');
      t.end();
    });
});

test.cb.skip('Invalid Content Type - Landing', t => {
  t.context.request
    .get('/content/foo')
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.is(res.status, 404, 'should return status 404');
      t.end();
    });
});

test.cb.skip('Content Type Add Page', t => {
  t.context.request
    .get('/content/services/add')
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.is(res.status, 200, 'should return status 200');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');
      t.end();
    });
});

test.cb.skip('Invalid Content Type - Add', t => {
  t.context.request
    .get('/content/foo/add')
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.is(res.status, 404, 'should return status 404');
      t.end();
    });
});

test.cb.skip('404 Page', t => {
  t.context.request
    .get('/foo')
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.is(res.status, 404, 'should return status 404');
      t.end();
    });
});
