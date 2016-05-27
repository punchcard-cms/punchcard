'use strict';

const database = require('./init/database');
const sessions = require('./init/sessions');
const views = require('./init/views');
const logger = require('./init/logger');
const locals = require('./init/locals');
const staticFiles = require('./init/static');
const settings = require('./init/settings');

module.exports = (application) => {
  return database(application).then(app => {
    return sessions(app);
  }).then(app => {
    return settings(app);
  }).then(app => {
    return views(app);
  }).then(app => {
    return logger(app);
  }).then(app => {
    return locals(app);
  }).then(app => {
    return staticFiles(app);
  });
};
