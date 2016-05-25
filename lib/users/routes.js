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
  loginMiddleware({
    'role': 'superadmin',
  }),
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
        user: req.user,
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
  loginMiddleware({
    'role': 'superadmin',
  }),
  (req, res, next) => {
    return users().then(userModel => {
      return contentTypes.form(userModel[0])
      .then(form => {
        res.render('users/add', {
          pageTitle: `${config.users.usersHome.title} :: Add`,
          formContents: form.html,
          validation: form.validation,
          user: req.user,
        });
      })
      .catch(error => {
        return next(error);
      });
    });
  });

// POST method route
router.post('/add', multipartMiddleware, (req, res) => {
  const data = Object.assign({}, req.body);
  const cleanData = {};
  Object.keys(data).map((key) => {
    const newKey = key.split('--')[0];
    cleanData[newKey] = data[key];
  });

  return database('users').insert(cleanData)
    .then(() => {
      res.redirect(`${config.users.usersHome.path}`);
    })
    .catch(err => {
      console.error(err);
    });
});


/*
User edit entry page
TODO: inject content into form
@function
@name /users/edit/{{id}}
*/
router.get('/edit/:id',
  (req, res) => {
    // this render should populate the form
    res.render('users/add', {
      pageTitle: `${config.users.usersHome.title} :: Edit User`,
      user: req.user,
    });
  });

// POST method route
router.post('/edit/:id', multipartMiddleware, () => {
  console.log('waiting on content types form parsing');
});

module.exports = router;
