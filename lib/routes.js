'use strict';

const index = require('./routes/index');
const robots = require('./routes/robots');
const content = require('./routes/content');
const workflows = require('./routes/workflows');
const login = require('./routes/login');
const users = require('./routes/users');
const api = require('./routes/api');
const applications = require('./routes/applications');
const errors = require('./routes/errors');
const styles = require('./routes/styles');


module.exports = application => {
  return index(application).then(app => {
    return login(app);
  }).then(app => {
    return robots(app);
  }).then(app => {
    return users(app);
  }).then(app => {
    return styles(app);
  }).then(app => {
    return content(app);
  }).then(app => {
    return workflows(app);
  }).then(app => {
    return api(app);
  }).then(app => {
    return applications(app);
  }).then(app => {
    return errors(app);
  });
};
