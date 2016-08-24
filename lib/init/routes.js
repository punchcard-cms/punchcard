'use strict';

const content = require('../content/utils');

module.exports = (app) => {
  return new Promise(res => {
    // add all content types and flows to request object
    app.use((request, response, next) => {
      request.types = app.get('content-types');
      request.flows = app.get('workflows');
      next();
    });

    app.use('/content/:type', content.check.url);
    app.use('/content/:type/:id', content.check.url);
    app.use('/content/:type/:id/:revision', content.check.url);
    app.use('/content/:type/:id/:revision/:action', content.check.url);

    res(app);
  });
};
