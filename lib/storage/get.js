'use strict';

const config = require('config');

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
