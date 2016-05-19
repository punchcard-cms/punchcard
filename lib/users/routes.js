'use strict';
/**
 * @fileoverview Content system routing
 */
const express = require('express');
const router = new express.Router();
const find = require('lodash/find');
const config = require('config');
const contentTypes = require('punchcard-content-types');
const users = require('./');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const knex = require('knex')(config.knex);
const db = require('../db');
const dataFunc = db.data;
const forms = require('../forms');

/*
Userss landing
@function
@name /users/
*/
router.get('/', (req, res) => {
  let content;
  console.log('ONE');
  dataFunc.getTable('users', knex)
  .then(rows => {
    console.log('TWO');
    content = rows;
  })
  .catch(error => {
    console.log('ERR');
    console.error(error);
  })
  .finally(() => {
    console.log('THREE');
    console.log(JSON.stringify(content, null, 4));
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
    })
  });
});

// POST method route
router.post('/add', multipartMiddleware, (req, res) => {
  console.log('NEW user added to database because awesome');
  //forms.submitForm(req, res, knex, 'users');
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
router.post('/edit/:id', multipartMiddleware, (req, res) => {
  console.log('Changed a users data because lost password');
});

module.exports = router;
