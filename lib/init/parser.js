'use strict';

const parser = require('body-parser');

module.exports = (app) => {
  return new Promise(res => {
    app.use(parser.json());
    app.use(parser.urlencoded({ extended: false }));

    res(app);
  });
};
