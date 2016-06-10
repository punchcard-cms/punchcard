'use strict';

/*
 * @fileoverview Content system routing
 *
 */
const config = require('config');
const content = require('punchcard-content-types');
const multipart = require('connect-multiparty');
const uuid = require('uuid');
const _ = require('lodash');

const utils = require('../utils');
const database = require('../database');

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
     * @name Content Home Page
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
    */
    app.get(`/${config.content.base}`, (req, res) => {
      res.render('content/home', {
        content: {
          home: config.content.home,
          base: config.content.base,
          types,
        },
      });
    });

    /*
     * @name Individual Content Type Landing Page
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     * @param {object} next - Express callback
    */
    app.get(`/${config.content.base}/:type`, (req, res, next) => {
      const type = utils.singleItem('id', req.params.type.toLowerCase(), types);

      if (type === false) {
        _.set(req.session, '404', {
          message: config.content.messages.missing.type.replace('%type', req.params.type),
          safe: `/${config.content.base}`,
        });

        return next();
      }

      // TEMP: use the first input of the first attribute as the primary title
      // TODO: create node in content-type conf
      type.primary = type.attributes[0].inputs[Object.keys(type.attributes[0].inputs)[0]].name;

      return database.select('*').from(`content-type--${type.id}`).then(rows => {
        res.render('content/landing', {
          title: config.content.base,
          content: rows,
          type,
          config: config.content,
        });
      });
    });

    /*
     * @name Individual Content Type Add Page
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     * @param {object} next - Express callback
    */
    app.get(`/${config.content.base}/:type/${config.content.actions.add}`, (req, res, next) => {
      const type = utils.singleItem('id', req.params.type.toLowerCase(), types);
      const errors = _.get(req.session, 'form.content.add.errors', {});
      let values = _.get(req.session, 'form.content.add.content', {});

      _.unset(req.session, 'form.content.add');

      values = utils.config(values);

      if (type === false) {
        _.set(req.session, '404', {
          message: config.content.messages.missing.type.replace('%type', req.params.type),
          safe: `/${config.content.base}`,
        });

        return next();
      }

      content.only(req.params.type, values, [type]).then(merged => {
        return content.form(merged, errors).then(form => {
          res.render('content/add', {
            form,
            action: req.url.replace(config.content.actions.add, config.content.actions.save),
            type,
            config: config.content,
          });
        });
      }).catch(e => {
        next(e);
      });

      return true;
    });

    /*
     * @name Individual Content Type Edit Page
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     * @param {object} next - Express callback
    */
    app.get(`/${config.content.base}/:type/:id/${config.content.actions.edit}`, (req, res, next) => {
      const type = utils.singleItem('id', req.params.type.toLowerCase(), types);

      // need to merge errors for edit/revisions
      // const errors = _.get(req.session, 'form.content.edit.errors', {});
      let values = _.get(req.session, 'form.content.edit.content', {});
      const data = {};

      _.unset(req.session, 'form.content.edit');

      values = utils.config(values);

      if (type === false) {
        _.set(req.session, '404', {
          message: config.content.messages.missing.type.replace('%type', req.params.type),
          safe: `/${config.content.base}`,
        });

        return next();
      }

      return database(`content-type--${type.id}`).where('id', req.params.id).then(rows => {
        if (rows.length < 1) {
          _.set(req.session, '404', {
            message: config.content.messages.missing.id.replace('%type', req.params.type).replace('%id', req.params.id),
            safe: `/${config.content.base}/${req.params.type}`,
          });

          return next();
        }

        const value = rows[0].value;

        // mapping data from database
        Object.keys(value).map(key => {
          // if sunrise/sunset object is structured differently
          if ((key === 'sunset-date') || (key === 'sunset-time') || (key === 'sunrise-date') || (key === 'sunrise-time')) {
            data[key] = {
              'value': value[key],
            };
          }
          else {
            const input = key.split('--');
            const inputName = input[0];
            const pluginType = input[1];
            data[inputName] = {};
            data[inputName][pluginType] = {
              'value': value[key],
            };
          }
        });

        return content.only(type.id, data);
      }).then(only => {
        return content.form(only);
      }).then(form => {
        res.render('content/add', {
          form,
          action: req.url.replace(config.content.actions.edit, config.content.actions.save),
          type,
          data,
        });
      }).catch(e => {
        next(e);
      });
    });

    /*
     * Save content type to db
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     * @param {object} next - Express callback
    */
    const save = (req, res, next) => {
      const type = utils.singleItem('id', req.params.type.toLowerCase(), types);

      if (type === false) {
        _.set(req.session, '404', {
          message: config.content.messages.missing.type.replace('%type', req.params.type),
          safe: `/${config.content.base}`,
        });

        return next();
      }

      // Validation
      const validated = content.form.validate(req.body, type);

      // utils.log(validated);

      if (validated === true) {
        // Sunrise/Sunset
        const sunrise = utils.time.iso(req.body['sunrise-date'], req.body['sunrise-time'], 'America/New_York');
        const sunset = utils.time.iso(req.body['sunset-date'], req.body['sunset-time'], 'America/New_York');

        database(`content-type--${req.params.type.toLowerCase()}`).insert({
          id: uuid.v4(),
          language: 'us-en',
          sunrise,
          sunset,
          approval: 0,
          publishable: false,
          value: req.body,
          author: req.user.id,
        }).then(() => {
          res.redirect(`/${config.content.base}/${req.params.type}`);
        }).catch(e => {
          next(e);
        });
      }
      else {
        const referrer = req.get('Referrer');
        _.set(req.session, 'form.content.add', {
          errors: validated,
          content: req.body,
        });
        res.redirect(referrer);
      }

      return true;
    };

    /*
     * @name Add - Post to Content Type
    */
    app.post(`/${config.content.base}/:type/${config.content.actions.save}`, multipartMiddleware, save);

    /*
     * @name Edit - Post to Content Type
    */
    app.post(`/${config.content.base}/:type/:id/${config.content.actions.save}`, multipartMiddleware, save);

    resolve(app);
  });
};

module.exports = routes;
