'use strict';

const config = require('config');
const path = require('path');
const _ = require('lodash');

/*
 * File Get
 *
 * @param {object} - A file object as stored in the database. Object must include 'relative' parameter
 *
 * @returns {object} - File object with the 'path' parameter added to include the configured storage public path (location)
 */
const get = file => {
  const f = file;
  let location = _.get(config.storage, 'public', '');

  if (location.indexOf('{{dest}}')) {
    location = location.replace('{{dest}}', config.storage.dest);
  }

  f.path = path.join(location, file.relative);

  return f;
};


module.exports = get;
