'use strict';

/**
 * @fileoverview Generic routing
 */
const express = require('express');
const router = new express.Router();
const passport = require('passport');

const loginMiddleware = require('../auth/login');

/*
Home Page Router
@function
@name /
*/
router.get('/',
  loginMiddleware(),
  (req, res) => {
    res.render('index', {
      pageTitle: 'Punchcard Home',
      user: req.user,
      req: req.session,
    });
  });

/*
403
@function
@name /
*/
router.get('/403',
  (req, res) => {
    const err = new Error('Permission denied');
    err.status = 403;
    res.render('error', {
      message: err.message,
      error: err,
    });
  });

/*
Login Page Router
@function
@name /login
*/
router.get('/login', (req, res) => {
  res.render('login', {
    pageTitle: 'Login',
  });
});

/*
Logout Router
@function
@name /logout
*/
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

// POST route
router.post('/login', passport.authenticate('local', {
  successReturnToOrRedirect: '/',
  failureRedirect: '/login',
}));

module.exports = router;
