'use strict';

const config = require('config');

module.exports = (application) => {
  return new Promise(res => {
    const app = application;

    app.locals.name = app.get('name');
    app.locals.nav = config.site.nav;

    res(app);
  });
};
