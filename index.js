'use strict';

/**
 * @fileoverview Punchcard CMS Init
 */
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const logger = require('morgan');
const nunjucks = require('nunjucks');
const path = require('path');
const config = require('config');
const contentTypes = require('punchcard-content-types');

const indexRoutes = require('./lib/routes/index');
const contentTypesRoutes = require('./lib/routes/content-types');

const app = express();

// Nunjucks templating setup
app.set('views', path.join(__dirname, 'views'));
nunjucks.configure(['views', 'templates'], {
  'autoescape': true,
  'express': app,
});
app.set('view engine', 'html');


// TODO: where does `dev` come from; should control with config
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*
  @name sitewide persistent variables
  @description create variables which will work in any route
 */
app.locals.siteName = 'Punchcard CMS';
app.locals.contentTypesConfig = config.contentTypes;
contentTypes().then(types => {
  // make content type object available to entire express app
  app.locals.contentTypesNames = types;

  return;
}).catch(err => {
  console.error(err);
});

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


/*
  @description run the server if and only if this file is being run directly
 */
if (!module.parent) {
  app.listen(config.env.port, () => {
    console.log(`Server starting on ${config.env.url}`);
  });
}

module.exports = app;
