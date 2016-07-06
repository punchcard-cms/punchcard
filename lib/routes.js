'use strict';

const index = require('./routes/index');
const content = require('./routes/content');
const workflows = require('./routes/workflows');
const login = require('./routes/login');
const users = require('./routes/users');
const errors = require('./routes/errors');


module.exports = application => {
  return index(application).then(app => {
    return login(app);
  }).then(app => {
    return users(app);
  }).then(app => {
    return content(app);
  }).then(app => {
    return workflows(app);
  }).then(app => {
    return errors(app);
  });
};
