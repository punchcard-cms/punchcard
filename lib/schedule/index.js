'use strict';

const Promise = require('bluebird');
const _ = require('lodash');

const utils = require('./utils');
const database = require('../database');

/*
 * Schedule content sunrise/sunset
 */
const schedule = (rev, ct) => {
  const revision = _.cloneDeep(rev);

  revision.type = ct.name;
  revision['type-slug'] = ct.id;
  revision.slug = _.kebabCase(revision.identifier);

  return utils.setup(revision).then(() => {
    return utils.sunrise(revision);
  }).then(() => {
    return utils.sunset(revision);
  });
};

/*
 * Bootstrap content on initialization
 */
const bootstrap = () => {
  return database('schedule').select('*').orderBy('sunrise').then(items => {
    return Promise.map(items, item => {
      return utils.sunrise(item).then(() => {
        return utils.sunset(item);
      });
    });
  }).then(() => {
    return database('live').select('*').then(items => {
      return Promise.map(items, item => {
        return utils.sunset(item);
      });
    });
  });
};


module.exports = schedule;
module.exports.bootstrap = bootstrap;
