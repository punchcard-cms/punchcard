'use strict';

const config = require('config');
const _ = require('lodash');
const urljoin = require('url-join');

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
  console.log(location);
  console.log(file.relative);
  console.log(urljoin(location, file.relative));

  f.path = urljoin(location, file.relative);

  return f;
};


module.exports = get;
