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
  (req, res) => {
  res.render('index', { pageTitle: 'Punchcard Home' });
});

/*
Home Page Router
@function
@name /
*/
router.get('/test',
  loginMiddleware,
  (req, res) => {
  res.render('index', { pageTitle: 'TEST TEST' });
});

/*
Login Page Router
@function
@name /
*/
router.get('/login', (req, res) => {
  res.render('login', {
    pageTitle: 'Login',
  });
});

// POST route
router.post('/login', passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login' }));

module.exports = router;
