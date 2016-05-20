'use strict';

module.exports = (application) => {
  return new Promise(res => {
    const app = application;

    app.locals.name = app.get('name');

    res(app);
  });
};
