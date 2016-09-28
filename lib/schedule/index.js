'use strict';

const Promise = require('bluebird');
const _ = require('lodash');

const utils = require('./utils');
const database = require('../database');

/*
 * Schedule content sunrise/sunset
 *
 * @param {object} rev - A full revision of a piece of content, with all fields that are saved in the database
 * @param {object} ct - The full object representation of a the revision's content type
 *
 * @return Promise
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
 *
 * @return Promise
 */
const bootstrap = (apps) => {
  return database('schedule').select('*').orderBy('sunrise').then(items => {
    return Promise.map(items, item => {
      return utils.sunrise(item, apps).then(() => {
        return utils.sunset(item, apps);
      });
    });
  }).then(() => {
    return database('live').select('*').then(items => {
      return Promise.map(items, item => {
        return utils.sunset(item, apps);
      });
    });
  });
};


module.exports = schedule;
module.exports.bootstrap = bootstrap;
