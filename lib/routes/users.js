'use strict';

/**
 * @fileoverview Login routing
 */
const config = require('config');
const types = require('punchcard-content-types');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const bcrypt = require('bcrypt-nodejs');

const acl = require('../auth/acl');
const getUserId = require('../auth/acl').getUserId;
const users = require('../users/data');
const database = require('../database');

/*
 * Users Route Handling
 * @description Adds user management routes handling to an Express app
 *
 * @param {object} application - Express Application
 * @returns {object} - Configured Express Application
 */
const routes = application => {
  return new Promise(resolve => {
    const app = application;

    /*
     * @name Users landing
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     * @param {object} next - Express callback
    */
    app.get('/users', acl.middleware(1, getUserId, 'view'), (req, res, next) => {
      database.select('*').from('users').then(rows => {
        res.render('users/landing', {
          title: config.users.home.title,
          users: rows,
          config: config.users,
          user: req.user,
        });
      })
      .catch(error => {
        next(error);
      });
    });

    /*
     * @name Add new user
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     * @param {object} next - Express callback
    */
    app.get('/users/add', acl.middleware(1, getUserId, 'create'), (req, res, next) => {
      users().then(model => {
        types.form(model[0])
        .then(form => {
          res.render('users/add', {
            title: config.users.add.title,
            form,
            action: config.users.add.path,
            user: req.user,
          });
        })
        .catch(error => {
          next(error);
        });
      });
    });

    /*
     * @name Add new user POST method
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     * @param {object} next - Express callback
    */
    app.post('/users/add', [multipartMiddleware, acl.middleware(1, getUserId, 'create')], (req, res, next) => {
      const data = {
        email: req.body['email--email'],
        role: req.body['role--select'],
        password: bcrypt.hashSync(req.body['password--password']),
      };
      database('users').insert(data).then(() => {
        res.redirect(`${config.users.home.path}`);
      })
      .catch(err => {
        next(err);
      });
    });

    /*
     * @name Edit a user
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     * @param {object} next - Express callback
    */
    app.get('/users/edit/:id', acl.middleware(1, getUserId, 'update'), (req, res, next) => {
      let user;

      // turnd off eslint: should be allowed to change req.session
      req.session.userEditId = req.params.id; // eslint-disable-line no-param-reassign

      return database('users').where('id', req.params.id).then(rows => {
        if (rows.length < 1) {
          res.status(404);
          const error = new Error(`${config.users.edit.error}`);
          res.render('error', error);
        }
        user = rows[0];

        return users();
      }).then(model => {
        // remove passwoord
        // TODO: password manipulation
        model[0].attributes.splice(1, 1);

        return types.only('users', {
          'email': {
            'email': {
              'value': user.email,
            },
          },
          'role': {
            'select': {
              'value': user.role,
            },
          },
        }, model);
      }).then(result => {
        return types.form(result);
      }).then(form => {
        res.render('users/add', {
          title: config.users.edit.title,
          form,
          action: config.users.edit.path,
          user: req.user,
        });
      })
      .catch(error => {
        next(error);
      });
    });

    /*
     * @name Edit user POST method
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     * @param {object} next - Express callback
    */
    app.post('/users/edit/', [multipartMiddleware, acl.middleware(1, getUserId, 'update')], (req, res, next) => {
      const data = {
        email: req.body['email--email'],
        role: req.body['role--select'],
      };

      database('users').where('id', '=', req.session.userEditId).update(data)
        .then(() => {
          // turnd off eslint: should be allowed to change req.session
          delete req.session.editUserId; // eslint-disable-line no-param-reassign
          res.redirect(`${config.users.home.path}`);
        })
        .catch(error => {
          next(error);
        });
    });

    /*
     * @name Delete a user
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     * @param {object} next - Express callback
    */
    app.get('/users/delete/:id', acl.middleware(1, getUserId, 'delete'), (req, res, next) => {
      // turnd off eslint: should be allowed to change req.session
      req.session.deleteUserId = req.params.id; // eslint-disable-line no-param-reassign
      database('users').where('id', req.params.id).then(rows => {
        if (rows.length < 1) {
          res.status(404);
          const error = new Error(`${config.users.delete.error}`);
          res.render('error', error);
        }
        const user = rows[0];
        res.render('users/delete', {
          title: config.users.edit.title,
          email: user.email,
          action: config.users.delete.path,
          user: req.user,
        });
      })
      .catch(error => {
        next(error);
      });
    });

    /*
     * @name Delete user POST method
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     * @param {object} next - Express callback
    */
    app.post('/users/delete', [multipartMiddleware, acl.middleware(1, getUserId, 'delete')], (req, res, next) => {
      database('users').where('id', '=', req.session.deleteUserId).del().then(() => {
        // turnd off eslint: should be allowed to change req.session
        delete req.session.deleteUserId; // eslint-disable-line no-param-reassign
        res.redirect(`${config.users.home.path}`);
      })
      .catch(error => {
        next(error);
      });
    });

    app.use(acl.middleware.errorHandler('html'));

    resolve(app);
  });
};

module.exports = routes;
