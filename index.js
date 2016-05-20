'use strict';

/**
 * @fileoverview Punchcard CMS Init
 */
const express = require('express');
const config = require('config');

const indexRoutes = require('./lib/routes/index');
const contentTypesRoutes = require('./lib/routes/content-types');

const init = require('./lib/init');

const application = express();

// Initialize the Database
const initApp = () => {
  return init(application).then(initialized => {
    const app = initialized;

    /*
      @name home page route
      @description create route for the site landing page
     */
    app.use('/', indexRoutes);

    /*
      @name content types route
      @description create routes for all content type configurations in ./content-types
     */
    app.use('/content', contentTypesRoutes);

    /*
      @name 404
      @description catch 404 and forward to error handler
     */
    app.use((req, res, next) => {
      const err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
      app.use((err, req, res) => {
        res.status(err.status || 500);
        res.render('error', {
          message: err.message,
          error: err,
        });
      });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use((err, req, res) => {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: {},
      });
    });

    return app;
  }).catch(e => {
    throw new Error(e);
  });
};

/*
  @description run the server if and only if this file is being run directly
 */
if (!module.parent) {
  initApp().then(app => {
    app.listen(config.env.port, () => {
      console.log(`Server starting on ${config.env.url}`);
    });
  });
}

module.exports = initApp;
