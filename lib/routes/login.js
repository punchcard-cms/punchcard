'use strict';

/**
 * @fileoverview Login routing
 */
const config = require('config');
const passport = require('passport');

const database = require('../database');

/*
 * Login Route Handling
 * @description Adds login and logout routes handling to an Express app
 *
 * @param {object} application - Express Application
 * @returns {object} - Configured Express Application
 */
const login = application => {
  return new Promise(resolve => {
    const app = application;

    /*
     * @name Login Page Router
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
    */
    app.get(config.authentication.login.path, (req, res) => {
      return database.select('*').from('users').then(rows => {
        // if any users in DB, we redirect to the top
        if (rows.length < 1) {
          return res.redirect(config.users.setup.path);
        }

        return res.render('login', {
          title: config.authentication.login.title,
        });
      });
    });

    /*
     * @name Logout Page Router
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
    */
    app.get(config.authentication.logout.path, (req, res) => {
      req.logout();
      res.redirect(config.authentication.login.path);
    });

    /*
     * @name Login Post
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
    */
    app.post(config.authentication.login.path, passport.authenticate('local', {
      successReturnToOrRedirect: '/',
      failureRedirect: config.authentication.login.path,
    }));

    resolve(app);
  });
};

module.exports = login;
