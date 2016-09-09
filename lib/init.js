'use strict';

const database = require('./init/database');
const sessions = require('./init/sessions');
const schedule = require('./init/schedule');
const passport = require('./init/passport');
const acl = require('./init/acl');
const views = require('./init/views');
const logger = require('./init/logger');
const parser = require('./init/parser');
const locals = require('./init/locals');
const staticFiles = require('./init/static');
const authenticated = require('./init/authenticated');
const settings = require('./init/settings');
const workflows = require('./init/workflows');
const routes = require('./init/routes');

module.exports = (application) => {
  return database(application).then(app => {
    return sessions(app);
  }).then(app => {
    return schedule(app);
  }).then(app => {
    return passport(app);
  }).then(app => {
    return acl(app);
  }).then(app => {
    return settings(app);
  }).then(app => {
    return workflows(app);
  }).then(app => {
    return routes(app);
  }).then(app => {
    return views(app);
  }).then(app => {
    return logger(app);
  }).then(app => {
    return parser(app);
  }).then(app => {
    return locals(app);
  }).then(app => {
    return authenticated(app);
  }).then(app => {
    return staticFiles(app);
  });
};
