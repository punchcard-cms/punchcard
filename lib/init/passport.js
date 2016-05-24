'use strict';

/**
 * @fileoverview Passport authentication init
 */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const database = require('../database');

// Passport Authentication setup
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
  },
  (username, password, cb) => {
    database.select('*').from('users').where({
      email: username,
      password,
    })
    .then(user => {
      if (user.length < 1) {
        return cb(null, false, { message: 'Incorrect login.' });
      }

      return cb(null, user[0]);
    })
    .catch(err => {
      return cb(err);
    });

  }));

// Configure Passport authenticated session persistence.
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((user, cb) => {
  database.select('*').from('users').where({ id: user })
    .then(user => {
      cb(null, user[0].id);
    })
    .catch(err => {
      console.log('deserializeUserERR');

      return cb(err);
    });
});

/**
 * @param {object} app - Express app
 *
 * @returns {object} app - Modified Express app
 */
const passportInit = (app) => {
  return new Promise((res) => {
    app.use(passport.initialize());
    app.use(passport.session());

    res(app);
  });
};

module.exports = passportInit;
