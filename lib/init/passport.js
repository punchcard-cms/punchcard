'use strict';

/**
 * @fileoverview Passport authentication init
 */
const config = require('config');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt-nodejs');

const acl = require('../auth/acl');

const database = require('../database');

// Passport Authentication setup
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
  },
  (username, password, cb) => {
    database.select('*').from('users').where({
      email: username,
    })
    .then(user => {
      if ((user.length < 1) || (!bcrypt.compareSync(password, user[0].password))) {
        return cb(null, false, { message: config.authentication.messages.badlogin });
      }

      // register user's role for access
      acl.addUserRoles(user[0].id.toString(), user[0].role);

      return cb(null, user[0].id);
    })
    .catch(err => {
      return cb(err);
    });
  }));

// Configure Passport authenticated session persistence.
passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  database.select('id', 'role', 'access').from('users').where({ id: user })
    .then(usr => {
      cb(null, usr[0]);
    })
    .catch(err => {
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
