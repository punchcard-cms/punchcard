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

const users = require('./data');
const database = require('../database');
const loginMiddleware = require('../auth/login');

/*
Users landing
@function
@name /users/
*/
router.get('/',
  loginMiddleware(),
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
    'redirectTo': '/login',
    'setReturnTo': '/users/add',
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
  const cleanData = users.cleanFormData(req.body);

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
  loginMiddleware(),
  (req, res, next) => {
    req.session.editUserId = req.params.id; // eslint-disable-line no-param-reassign

    return database('users').where('id', req.params.id)
    .then(rows => {
      if (rows.length < 1) {
        const err = new Error(`User with id ${req.params.id} does not exist`);
        err.status = 404;
        res.render('error', {
          message: err.message,
          error: err,
        });

        return next();
      }

      return users().then(userModel => {
        // remove passwoord
        // TODO: password manipulation
        userModel[0].attributes.splice(1, 1);

        return contentTypes.only('users', {
          'email': {
            'email': {
              'value': rows[0].email,
            },
          },
          'role': {
            'select': {
              'value': rows[0].role,
            },
          },
        }, userModel)
        .then(result => {
          return contentTypes.form(result).then(form => {
            res.render('users/add', {
              pageTitle: `${config.users.usersHome.title} :: Edit :: ${req.params.id}`,
              formContents: form.html,
              validation: form.validation,
              user: req.user,
            });
          });
        })
        .catch(error => {
          return next(error);
        });
      })
      .catch(error => {
        return next(error);
      });
    })
    .catch(error => {
      return next(error);
    });
  });

// POST method route
router.post('/edit/:id', multipartMiddleware, (req, res) => {
  const cleanData = users.cleanFormData(req.body);

  return database('users').where('id', '=', req.session.editUserId).update(cleanData)
    .then(() => {
      req.session.editUserId = ''; // eslint-disable-line no-param-reassign
      res.redirect(`${config.users.usersHome.path}`);
    })
    .catch(err => {
      console.error(err);
    });
});

module.exports = router;
