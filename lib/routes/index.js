'use strict';

const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
/*
 * Index Route Handling
 * @description Adds index routing to an Express app
 *
 * @param {object} application - Express Application
 * @returns {object} - Configured Express Application
 */
const index = application => {
  return new Promise(resolve => {
    const app = application;

    /*
     * Home Page Router
     * @function
     * @name /
     */
    app.get('/', (req, res) => {
      res.render('index', { pageTitle: 'Punchcard Home' });
    });

    resolve(app);
  });
};

module.exports = index;
