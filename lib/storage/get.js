'use strict';

const config = require('config');

/*
 * File Get
 *
 * @param {array} - Array of file objects as stored in the database. Object must include 'path' parameter
 *
 * @returns {array} - Array of file objects with the 'path' parameter transformed to include the configured destination path
 */
const get = files => {
  let path = config.storage.public;

  if (path.indexOf('{{dest}}')) {
    path = path.replace('{{dest}}', config.storage.dest);
  }

  if (path.substr(-1) !== '/') {
    path += '/';
  }

  return files.map(file => {
    const f = file;
    f.path = path + file.path;

    return f;
  });
};


module.exports = get;
