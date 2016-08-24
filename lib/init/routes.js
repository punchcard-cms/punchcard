'use strict';

const _ = require('lodash');
const content = require('../content/utils');

module.exports = (app) => {
  return new Promise(res => {
    // add all content types and flows to request object
    app.use((req, response, next) => {
      const request = req;
      _.set(request, 'content.types', app.get('content-types'));
      _.set(request, 'content.workflows', app.get('workflows'));
      next();
    });

    app.use('/content/:type', content.url);
    app.use('/content/:type/:id', content.url);
    app.use('/content/:type/:id/:revision', content.url);
    app.use('/content/:type/:id/:revision/edit', content.url);
    app.use('/content/:type/:id/:revision/approve', content.url);

    res(app);
  });
};
