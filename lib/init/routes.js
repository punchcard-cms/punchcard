'use strict';

const _ = require('lodash');
const content = require('../content/middleware');
const users = require('../users/middleware');

module.exports = (app) => {
  return new Promise(res => {
    // add all content types and flows to request object
    app.use((req, response, next) => {
      const request = req;
      _.set(request, 'content.types', app.get('content-types'));
      _.set(request, 'content.workflows', app.get('workflows'));

      next();
    });

    app.use('/content/:type', content);
    app.use('/content/:type/:id', content);
    app.use('/content/:type/:id/:revision', content);
    app.use('/content/:type/:id/:revision/edit', content);
    app.use('/content/:type/:id/:revision/approve', content);

    app.use('/users/:id', users);

    res(app);
  });
};
