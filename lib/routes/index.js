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
  loginMiddleware,
  (req, res) => {
  res.render('index', { pageTitle: 'Punchcard Home' });
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
router.post('/login', passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login' }));

module.exports = router;
