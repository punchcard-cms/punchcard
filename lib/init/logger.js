'use strict';

const logger = require('morgan');

module.exports = (app) => {
  return new Promise(res => {
    app.use(logger('dev'));

    res(app);
  });
};
