'use strict';

/**
 * @fileoverview Punchcard CMS Init
 */
const bodyParser = require('body-parser');
const express = require('express');
const logger = require('morgan');
const nunjucks = require('nunjucks');
const path = require('path');
const config = require('config');
const contentTypes = require('punchcard-content-types');

// NEW for user AUTH:
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const knex = require('knex')(config.knex);
const db = require('./lib/db');

const users = require('./lib/users');
const indexRoutes = require('./lib/routes/index');
const contentTypesRoutes = require('./lib/routes/content-types');
const session = require('./lib/auth/sessions');

let app = express();

app = session(app);

// Nunjucks templating setup
const views = [
  path.join(process.cwd(), 'views'),
  path.join(process.cwd(), 'templates'),
  path.join(__dirname, 'views'),
  path.join(__dirname, 'templates'),
];

nunjucks.configure(views, {
  'autoescape': true,
  'express': app,
});
app.set('view engine', 'html');

// Passport Authentication setup
passport.use(new LocalStrategy({
    usernameField: 'email',
  },
  function(username, password, done) {
    console.log('I AM LOCAL STRAT');
    knex.select('*').from('users').where({ email: username, password: password })
      .then(user => {
        console.log('user');
        console.log(user);
        if (!user) {
          return done(null, false, { message: 'Incorrect login.' });
        }
        return done(null, user);
      })
      .catch(err => {
        return done(err);
      })
  }
));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  console.log('serializeUser');
  console.log(user);
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});


// TODO: where does `dev` come from; should control with config
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(process.cwd(), 'public')));

app.use(passport.initialize());
app.use(passport.session());
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
  @name users route
  @description create routes for users
 */
app.use('/users', users.userRoutes);

// TEMP: will be removed when we have a table-making process
users.checkUserTable();

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
