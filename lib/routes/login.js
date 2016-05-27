'use strict';

/**
 * @fileoverview Login routing
 */
const passport = require('passport');

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
    app.get('/login', (req, res) => {
      res.render('login', {
        pageTitle: 'Login',
      });
    });

    /*
     * @name Logout Page Router
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
    */
    app.get('/logout', (req, res) => {
      req.logout();
      res.redirect('/login');
    });

    /*
     * @name Login Post
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
    */
    app.post('/login', passport.authenticate('local', {
      successReturnToOrRedirect: '/',
      failureRedirect: '/login',
    }));

    resolve(app);
  });
};

module.exports = login;
