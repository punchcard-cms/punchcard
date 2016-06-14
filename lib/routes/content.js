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

      database
        .distinct(database.raw('ON (id) id'))
        .select('*')
        .from(`content-type--${type.id}`)
        .orderBy('id', 'DESC')
        .orderBy('revision', 'DESC').then(rows => {
          res.render('content/landing', {
            title: config.content.base,
            content: rows,
            type,
            config: config.content,
          });
        });

      return true;
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
      const errors = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].errors`, {});
      let values = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].content`, {});

      _.unset(req.session, 'form.content.add');

      values = utils.config(values);

      if (type === false) {
        _.set(req.session, '404', {
          message: config.content.messages.missing.type.replace('%type', req.params.type),
          safe: `/${config.content.base}`,
        });

        return next();
      }

      content.only(req.params.type.toLowerCase(), values, [type]).then(merged => {
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
    app.get(`/${config.content.base}/:type/:id/:revision/${config.content.actions.edit}`, (req, res, next) => {
      const type = utils.singleItem('id', req.params.type.toLowerCase(), types);
      const errors = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].errors`, {});
      const idSess = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].id`, {});
      const revisionSess = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].revision`, {});
      let values = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].content`, {});
      const data = {};
      let revisionSearch;

      _.unset(req.session, 'form.content.add');

      values = utils.config(values);

      // no content type in url, so 404
      if (type === false) {
        _.set(req.session, '404', {
          message: config.content.messages.missing.type.replace('%type', req.params.type),
          safe: `/${config.content.base}`,
        });

        return next();
      }

      // no id in url, so 404
      if (!req.params.id) {
        _.set(req.session, '404', {
          message: config.content.messages.missing.id.replace('%type', req.params.type).replace('%id', req.params.id),
          safe: `/${config.content.base}/${req.params.type}`,
        });

        return next();
      }

      // no revision in url, so create search to find latest revision
      if (!req.params.revision || !Number.isInteger(req.params.revision)) {
        revisionSearch = database(`content-type--${type.id}`)
          .select('revision')
          .where('id', req.params.id)
          .orderBy('revision', 'DESC')
          .limit(1);
      }
      else {
        revisionSearch = database(`content-type--${type.id}`)
          .select('revision')
          .where('revision', req.params.revision);
      }


      // something went wrong on save:
      if (Object.keys(values).length > 0) {
        // add the previous session data back in
        _.set(req.session, 'form.content.add', {
          [req.params.type.toLowerCase()]: {
            id: idSess,
            revision: revisionSess,
          },
        });

        return content.only(req.params.type.toLowerCase(), values, [type]).then(merged => {
          return content.form(merged, errors).then(form => {
            res.render('content/add', {
              form,
              action: `/${config.content.base}/:type/${config.content.actions.save}`,
              type,
              config: config.content,
            });
          });
        }).catch(e => {
          next(e);
        });
      }

      // eslint mad if no return, then mad at this else if it is there
      else { // eslint-disable-line no-else-return
        // Search for the revision
        return revisionSearch.then(rows => {
          if (rows.length < 1) {
            _.set(req.session, '404', {
              message: config.content.messages.missing.revision.replace('%type', req.params.type).replace('%id', req.params.id),
              safe: `/${config.content.base}/${req.params.type}`,
            });

            return next();
          }
          const revision = rows[0].revision;

          return database(`content-type--${type.id}`).where({
            id: req.params.id,
            revision,
          });
        }).then(rows => {
          if (rows.length < 1) {
            _.set(req.session, '404', {
              message: config.content.messages.missing.id.replace('%type', req.params.type).replace('%id', req.params.id).replace('%revision', req.params.revision),
              safe: `/${config.content.base}/${req.params.type}`,
            });

            return next();
          }

          const value = rows[0].value;

          // add session data for this content
          _.set(req.session, 'form.content.add', {
            [req.params.type.toLowerCase()]: {
              id: rows[0].id,
              revision: rows[0].revision,
            },
          });

          // mapping data from database
          Object.keys(value).map(key => {
            // if sunrise/sunset, object is structured differently
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
            action: `/${config.content.base}/${req.params.type.toLowerCase()}/${config.content.actions.save}`,
            type,
            data,
          });
        }).catch(e => {
          next(e);
        });
      }
    });

    /*
     * @name Save - Post to Content Type
     * Save content type to db
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     * @param {object} next - Express callback
    */
    app.post(`/${config.content.base}/:type/${config.content.actions.save}`, multipartMiddleware, (req, res, next) => {
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
        // id
        let id = uuid.v4();
        const sessionId = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].id`, '');
        if (sessionId) {
          id = sessionId;
        }

        // Sunrise/Sunset
        const sunrise = utils.time.iso(req.body['sunrise-date'], req.body['sunrise-time'], 'America/New_York');
        const sunset = utils.time.iso(req.body['sunset-date'], req.body['sunset-time'], 'America/New_York');

        // language
        let language = 'us-en';
        if (req.body.hasOwnProperty('language')) {
          language = req.body.language;
        }

        // approval
        let approval = 0;
        if (req.body.hasOwnProperty('approval')) {
          approval = req.body.approval;
        }

        database(`content-type--${req.params.type.toLowerCase()}`).insert({
          id,
          language,
          sunrise,
          sunset,
          approval,
          publishable: false,
          value: req.body,
          author: req.user.id,
        }).returning(['id', 'revision']).then((latest) => {
          _.set(req.session, 'form.content.recent', {
            [req.params.type.toLowerCase()]: {
              id: latest.id,
              revision: latest.revision,
            },
          });
          res.redirect(`/${config.content.base}/${req.params.type}`);
        }).catch(e => {
          next(e);
        });
      }
      else {
        const referrer = req.get('Referrer');
        _.set(req.session, 'form.content.add', {
          [req.params.type.toLowerCase()]: {
            errors: validated,
            content: req.body,
          },
        });
        res.redirect(referrer);
      }

      return true;
    });

    resolve(app);
  });
};

module.exports = routes;
