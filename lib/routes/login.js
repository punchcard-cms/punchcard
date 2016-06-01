'use strict';

/**
 * @fileoverview Login routing
 */
const passport = require('passport');
const acl = require('../auth/acl');
const getUserId = require('../auth/acl').getUserId;

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

    /*
     * @name Login Status
     * Check your current user and roles
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
    */
    app.get( '/status', function(req, res) {
      console.log('req.user');
      console.log(req.user);
      console.log('getUserId(req)');
      console.log(getUserId(req));
      console.log(typeof getUserId(req));
      acl.whatResources('admin', function (err, resources) {
        if (err) console.log(err);
        console.log('whatResources');
        console.log(resources);
      });
      acl.hasRole(getUserId(req), 'admin', function(err, obj) {
        console.log('hasRole');
        console.log(obj);
      });
      acl.userRoles(getUserId(req), function( err, roles ){
        res.send( 'User: ' + JSON.stringify( req.user ) + ' Roles: ' + JSON.stringify( roles ) );
      });
    });

    resolve(app);
  });
};

module.exports = login;
