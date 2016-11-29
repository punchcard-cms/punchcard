'use strict';

/*
 * Styles Route Handling
 * @description Adds index routing to an Express app
 *
 * @param {object} application - Express Application
 * @returns {object} - Configured Express Application
 */
const data = require('./data/styles');
const styles = application => {
  return new Promise(resolve => {
    const app = application;

    /*
     * Home Page Router
     * @function
     * @name /
     */
    app.get('/styles', (req, res) => {
      res.render('styles', data);
    });

    resolve(app);
  });
};

module.exports = styles;
