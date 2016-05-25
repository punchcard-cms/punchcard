'use strict';

/**
 * @fileoverview Users routing
 */
const express = require('express');
const router = new express.Router();
const config = require('config');
const contentTypes = require('punchcard-content-types');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

const users = require('./model');
const database = require('../database');
const loginMiddleware = require('../auth/login');

/*
Userss landing
@function
@name /users/
*/
router.get('/',
  loginMiddleware({ 'role': 'superadmins' }),
  (req, res, next) => {
    let content;
    database.select('*').from('users')
    .then(rows => {
      content = rows;
    })
    .catch(error => {
      return next(error);
    })
    .finally(() => {
      res.render('users/landing', {
        pageTitle: config.users.usersHome.title,
        usersContent: content,
        usersConfig: config.users,
      });

      return;
    });
  });

/*
Users add-new page
@function
@name /users/add
*/
router.get('/add',
  loginMiddleware(),
  (req, res, next) => {
    return users().then(userModel => {
      return contentTypes.form(userModel[0])
      .then(form => {
        res.render('users/add', {
          pageTitle: `${config.users.usersHome.title} :: Add`,
          formContents: form.html,
          validation: form.validation,
        });
      })
      .catch(error => {
        return next(error);
      });
    });
  });

// POST method route
router.post('/add', multipartMiddleware, () => {
  console.log('waiting on content types form parsing');
});


/*
User edit entry page
TODO: inject content into form
@function
@name /users/edit/{{id}}
*/
router.get('/edit/:id',
  loginMiddleware(),
  (req, res) => {
    // this render should populate the form
    res.render('users/add', {
      pageTitle: `${config.users.usersHome.title} :: Edit User`,
    });
  });

// POST method route
router.post('/edit/:id', multipartMiddleware, () => {
  console.log('waiting on content types form parsing');
});

module.exports = router;
