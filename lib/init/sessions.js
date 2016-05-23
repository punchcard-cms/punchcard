'use strict';

const session = require('express-session');
const knex = require('knex');
const KnexSessionStore = require('connect-session-knex')(session);
const config = require('config');

const store = new KnexSessionStore({
  knex: knex(config.knex),
});

/**
 * @param {object} app - Express app
 *
 * @returns {object} app - Modified Express app
 */
const sessions = (app) => {
  return new Promise((res) => {
    // Secure Sessions
    if (config.cookies.secure) {
      app.set('trust proxy', 1);
    }

    app.use(session({
      secret: config.cookies.secret,
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: config.cookies.secure,
        maxAge: config.cookies.maxAge,
      },
      store,
    }));

    res(app);
  });
};

module.exports = sessions;
