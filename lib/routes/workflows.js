'use strict';

/*
 * @fileoverview Content system routing
 *
 */
const config = require('config');
const content = require('punchcard-content-types');
const _ = require('lodash');

const utils = require('../utils');
const database = require('../database');
const flow = require('../workflows/data');

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

    // const workflows = app.get('workflows');

    /*
     * @name Individual Content Type Approval Page
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     * @param {object} next - Express callback
    */
    app.get(`/${config.content.base}/:type/:revision/${config.content.actions.approve}`, (req, res, next) => {
      const type = utils.singleItem('id', req.params.type.toLowerCase(), types);

      // revision in url is not a number
      if (!Number.isInteger(parseInt(req.params.revision, 10))) {
        _.set(req.session, '404', {
          message: config.content.messages.format.revision.replace('%revision', req.params.revision),
          safe: `/${config.content.base}`,
        });

        return next();
      }

      return database(`content-type--${type.id}`)
        .select('*')
        .where('revision', req.params.revision)
        .then(rows => {
          if (rows.length < 1) {
            _.set(req.session, '404', {
              message: config.content.messages.missing.revision.replace('%revision', req.params.revision).replace('%type', req.params.type),
              safe: `/${config.content.base}/${req.params.type}`,
            });

            return next();
          }
          const revision = rows[0];
          const values = [];

          // mapping values from database
          Object.keys(revision.value).map(key => {
            const input = key.split('--');
            const data = {
              name: input[0],
              value: revision.value[key],
            };
            values.push(data);
          });

          return flow().then(workflow => {
            return content.only('workflow', {}, workflow).then(wf => {
              return content.form(wf).then(form => {
                res.render('content/approval', {
                  title: `${config.content.actions.approve} :: ${req.params.type}`,
                  form,
                  action: `/${config.content.base}/${req.params.type.toLowerCase()}/${config.content.actions.save}/${config.content.actions.approval}`,
                  revision,
                  values,
                  type,
                  config: config.content,
                });
              });
            });
          }).catch(error => {
            next(error);
          });
        });
    });

    resolve(app);
  });
};

module.exports = routes;
