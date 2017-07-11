'use strict';

const config = require('config');
const _ = require('lodash');
const urljoin = require('url-join');

/*
 * File Get
 *
 * @param {object} - A file object as stored in the database. Object must include 'relative' parameter
 *
 * @returns {object} - File object with the 'path' parameter added to include the configured destination path
 */
const get = file => {
  const f = file;
  let path = _.get(config.storage, 'public', '');

  if (path.indexOf('{{dest}}')) {
    path = path.replace('{{dest}}', config.storage.dest);
  }

  f.path = urljoin(path, file.relative);

  return f;
};


module.exports = get;
