'use strict';

/**
 * @fileoverview Login routing
 */
const config = require('config');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

const acl = require('../auth/acl');
const getUserId = acl.getUserId;
const users = require('../users');

/*
 * Users Route Handling
 * @description Adds user management routes handling to an Express app
 *
 * @param {object} application - Express Application
 * @returns {object} - Configured Express Application
 */
const routes = application => {
  const app = application;

  return new Promise(resolve => {
    /*
     *  First time setup: Create administrator (no users in DB)
     */
    app.get(config.users.setup.path, users.routes.setup);

    /*
     *  First time setup: save administrator (no users in DB)
     */
    app.post(config.users.setup.path, multipartMiddleware, users.routes.first);

    /*
     *  Save new administrator (no users in DB)
     */
    app.get(`/${config.users.setup.path}/${config.users.actions.save}`, users.routes.setup);


    /*
     *  Landing for all users
     */
    app.get(`/${config.users.base}`, users.routes.all);

    /*
     * @name Add new user
     */
    app.get(`/${config.users.base}/${config.users.actions.add}`, acl.middleware(1, getUserId, 'create'), users.routes.add);

    /*
     *  View/edit/delete a single user
     */
    app.get(`/${config.users.base}/:id`, acl.middleware(1, getUserId, 'update'), users.routes.one);

    /*
     *  Save a single user
     */
    app.post(`/${config.users.base}/${config.users.actions.save}`, [multipartMiddleware, acl.middleware(1, getUserId, 'update')], users.routes.save);


    app.use(acl.middleware.errorHandler('html'));

    resolve(app);
  });
};

module.exports = routes;
