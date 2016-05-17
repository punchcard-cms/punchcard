import test from 'ava';
import request from 'supertest';
import app from '../';

// cue up our application for all tests
test.beforeEach((t) => {
  // Ignoring this param reassign as it's the standard for AVA to allow users to assign context to the tests
  t.context.request = request(app); // eslint-disable-line no-param-reassign
});

test.cb('CMS Landing Page', (t) => {
  t.context.request
    .get('/')
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.is(res.status, 200, 'should return status 200');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');
      t.end();
    });
});

test.cb('Content Types Landing Page', (t) => {
  t.context.request
    .get('/content')
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.is(res.status, 200, 'should return status 200');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');
      t.end();
    });
});
