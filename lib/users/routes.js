'use strict';

/**
 * @fileoverview Content system routing
 */
const express = require('express');
const router = new express.Router();
const config = require('config');
const contentTypes = require('punchcard-content-types');
const users = require('./');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const database = require('../database');

/*
Userss landing
@function
@name /users/
*/
router.get('/', (req, res) => {
  let content;
  database.select('*').from('users')
  .then(rows => {
    content = rows;
  })
  .catch(error => {
    console.error(error);
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
router.get('/add', (req, res) => {
  return users.userContentType().then(userContentType => {
    return contentTypes.form(userContentType[0])
    .then(form => {
      res.render('users/add', {
        pageTitle: `${config.users.usersHome.title} :: Add`,
        formContents: form.html,
        validation: form.validation,
      });
    })
    .catch(err => {
      console.error(err);
    });
  });
});

// POST method route
router.post('/add', multipartMiddleware, () => {
  console.log('NEW user added to database because awesome');
});


/*
User edit entry page
TODO: inject content into form
@function
@name /users/edit/{{id}}
*/
router.get('/edit/:id', (req, res) => {
  // this render should populate the form
  res.render('users/add', {
    pageTitle: `${config.users.usersHome.title} :: Edit User`,
  });
});

// POST method route
router.post('/edit/:id', multipartMiddleware, () => {
  console.log('Changed a users data because lost password');
});

module.exports = router;
