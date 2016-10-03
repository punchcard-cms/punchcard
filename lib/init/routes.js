'use strict';

const _ = require('lodash');
const content = require('../content/middleware');

module.exports = (app) => {
  return new Promise(res => {
    // add all content types and flows to request object
    app.use((req, response, next) => {
      const request = req;
      _.set(request, 'content.types', app.get('content-types'));
      _.set(request, 'content.workflows', app.get('workflows'));
      _.set(request, 'applications.apps', app.get('applications'));
      _.set(request, 'applications.merged', app.get('applications-merged'));
      next();
    });

    app.use('/content/:type', content);
    app.use('/content/:type/:id', content);
    app.use('/content/:type/:id/:revision', content);
    app.use('/content/:type/:id/:revision/edit', content);
    app.use('/content/:type/:id/:revision/approve', content);

    res(app);
  });
};
