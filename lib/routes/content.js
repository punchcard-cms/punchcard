'use strict';

/*
 * @fileoverview Content system routing
 *
 */

const config = require('config');
const content = require('punchcard-content-types');
const multipart = require('connect-multiparty');
const uuid = require('uuid');

const utils = require('../utils');
const db = require('../database');

const multipartMiddleware = multipart();

/*
 * Content Route Resolution
 *
 * @param {object} application - Express Application
 * @returns {object} - Configured Express Application
 */
const routes = application => {
  return new Promise(resolve => {
    const app = application;
    const types = app.get('content-types');

    /*
     * Content Home Page
     */
    app.get(`/${config.content.base}`, (req, res) => {
      res.render('content-types/home', {
        content: {
          home: config.content.home,
          base: config.content.base,
          types,
        },
      });
    });

    /*
     * Individual Content Type Landing Page
     */
    app.get(`/${config.content.base}/:type`, (req, res, next) => {
      const type = utils.singleItem('id', req.params.type.toLowerCase(), types);

      if (type === false) {
        const missing = config.content.messages.missing.replace('%type', req.params.type);

        return next(new Error(missing));
      }

      res.render('content-types/landing', {
        content: {
          base: req.url,
          actions: config.content.actions,
          type,
        },
      });

      return true;
    });

    /*
     * Individual Content Type Add Page
     */
    app.get(`/${config.content.base}/:type/${config.content.actions.add}`, (req, res, next) => {
      const type = utils.singleItem('id', req.params.type.toLowerCase(), types);
      let errors = {};
      let values = {};

      try {
        errors = req.session.form.content.add.errors;
      }
      catch (e) {
        errors = {};
      }

      try {
        values = req.session.form.content.add.content;
      }
      catch (e) {
        values = {};
      }

      try {
        delete req.session.form.content.add; // eslint-disable-line no-param-reassign
      }
      catch (e) {
        req.session.form.content.add = {}; // eslint-disable-line no-param-reassign
      }

      values = utils.config(values);

      if (type === false) {
        const missing = config.content.messages.missing.replace('%type', req.params.type);

        return next(new Error(missing));
      }

      content.only(req.params.type, values, [type]).then(merged => {
        return content.form(merged, errors).then(form => {
          res.render('content-types/add', {
            form,
            action: req.url.replace(config.content.actions.add, config.content.actions.save),
          });
        });
      }).catch(e => {
        next(e);
      });

      return true;
    });

    /*
     *  Post to Content Type
     */
    app.post(`/${config.content.base}/:type/${config.content.actions.save}`, multipartMiddleware, (req, res, next) => {
      const type = utils.singleItem('id', req.params.type.toLowerCase(), types);

      if (type === false) {
        const missing = config.content.messages.missing.replace('%type', req.params.type);

        return next(new Error(missing));
      }

      // Validation
      const validated = content.form.validate(req.body, type);

      // utils.log(validated);

      if (validated === true) {
        // Sunrise/Sunset
        const sunrise = utils.time.iso(req.body['sunrise-date'], req.body['sunrise-time'], 'EDT');
        const sunset = utils.time.iso(req.body['sunset-date'], req.body['sunset-time'], 'EDT');

        db(`content-type--${req.params.type.toLowerCase()}`).insert({
          id: uuid.v4(),
          language: 'us-en',
          sunrise,
          sunset,
          approval: 0,
          publishable: false,
          value: req.body,
        }).then(() => {
          res.redirect(`/${config.content.base}/${req.params.type}`);
        }).catch(e => {
          next(e);
        });
      }
      else {
        const referrer = req.get('Referrer');
        req.session.form = { // eslint-disable-line no-param-reassign
          content: {
            add: {
              errors: validated,
              content: req.body,
            },
          },
        };
        res.redirect(referrer);
      }

      return true;
    });

    resolve(app);
  });
};

module.exports = routes;
