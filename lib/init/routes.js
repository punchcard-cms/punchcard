'use strict';

const content = require('../content/utils');

module.exports = (app) => {
  return new Promise(res => {
    // add all content types and flows to request object
    app.use((req, response, next) => {
      const request = req;
      request.types = app.get('content-types');
      request.flows = app.get('workflows');
      next();
    });

    app.use('/content/:type', content.check.url);
    app.use('/content/:type/:id', content.check.url);
    app.use('/content/:type/:id/:revision', content.check.url);
    app.use('/content/:type/:id/:revision/edit', content.check.url);
    app.use('/content/:type/:id/:revision/approve', content.check.url);

    res(app);
  });
};
