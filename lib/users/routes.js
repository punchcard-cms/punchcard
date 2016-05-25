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
  loginMiddleware({
    'role': 'superadmin',
    'redirectTo': '/login',
    'setReturnTo': '/users/add',
  }),
  (req, res, next) => {
    let content;
    database.select('*').from('users')
    .then(rows => {
      content = rows;
    })
    .catch(error => {
      next(error);
    })
    .finally(() => {
      res.render('users/landing', {
        pageTitle: config.users.usersHome.title,
        usersContent: content,
        usersConfig: config.users,
        user: req.user,
      });
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
    users().then(userModel => {
      contentTypes.form(userModel[0])
      .then(form => {
        res.render('users/add', {
          pageTitle: `${config.users.usersHome.title} :: Add`,
          formContents: form.html,
          validation: form.validation,
          user: req.user,
        });
      })
      .catch(error => {
        next(error);
      });
    });
  });

// POST method route
router.post('/add', multipartMiddleware, (req, res) => {
  const cleanData = users.cleanFormData(req.body);

  database('users').insert(cleanData)
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
  loginMiddleware({
    'role': 'superadmin',
    'redirectTo': '/login',
    'setReturnTo': '/users/add',
  }),
  (req, res, next) => {
    req.session.editUserId = req.params.id; // eslint-disable-line no-param-reassign

    database('users').where('id', req.params.id)
    .then(rows => {
      if (rows.length < 1) {
        const err = new Error(`User with id ${req.params.id} does not exist`);
        err.status = 404;
        res.render('error', {
          message: err.message,
          error: err,
        });
      }

      users().then(userModel => {
        // remove passwoord
        // TODO: password manipulation
        userModel[0].attributes.splice(1, 1);

        contentTypes.only('users', {
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
          contentTypes.form(result).then(form => {
            res.render('users/add', {
              pageTitle: `${config.users.usersHome.title} :: Edit :: ${req.params.id}`,
              formContents: form.html,
              validation: form.validation,
              user: req.user,
            });
          });
        })
        .catch(error => {
          next(error);
        });
      })
      .catch(error => {
        next(error);
      });
    })
    .catch(error => {
      next(error);
    });
  });

// POST method route
router.post('/edit/:id', multipartMiddleware, (req, res) => {
  const cleanData = users.cleanFormData(req.body);

  database('users').where('id', '=', req.session.editUserId).update(cleanData)
    .then(() => {
      req.session.editUserId = ''; // eslint-disable-line no-param-reassign
      res.redirect(`${config.users.usersHome.path}`);
    })
    .catch(err => {
      console.error(err);
    });
});

/*
User delete entry page
@function
@name /users/delete/{{id}}
*/
router.get('/delete/:id',
  loginMiddleware({
    'role': 'superadmin',
    'redirectTo': '/login',
    'setReturnTo': '/users/add',
  }),
  (req, res, next) => {
    req.session.deleteUserId = req.params.id; // eslint-disable-line no-param-reassign

    database('users').where('id', req.params.id)
    .then(rows => {
      if (rows.length < 1) {
        const err = new Error(`User with id ${req.params.id} does not exist`);
        err.status = 404;
        res.render('error', {
          message: err.message,
          error: err,
        });
      }
      res.render('users/delete', {
        pageTitle: `${config.users.usersHome.title} :: DELETE :: ${req.params.id}`,
        userEmail: rows[0].email,
        user: req.user,
      });
    })
    .catch(error => {
      next(error);
    });
  });


// POST method route
router.post('/delete/:id', multipartMiddleware, (req, res) => {
  database('users').where('id', '=', req.session.deleteUserId).del()
    .then(() => {
      req.session.deleteUserId = ''; // eslint-disable-line no-param-reassign
      res.redirect(`${config.users.usersHome.path}`);
    })
    .catch(err => {
      console.error(err);
    });
});

module.exports = router;
