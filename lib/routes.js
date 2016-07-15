'use strict';

const index = require('./routes/index');
const content = require('./routes/content');
const login = require('./routes/login');
const users = require('./routes/users');
const errors = require('./routes/errors');
const styles = require('./routes/styles');


module.exports = application => {
  return index(application).then(app => {
    return login(app);
  }).then(app => {
    return users(app);
  }).then(app => {
    return styles(app);
  }).then(app => {
    return content(app);
  }).then(app => {
    return errors(app);
  });
};
