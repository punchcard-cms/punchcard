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
const workflows = require('../workflows');

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
    const allFlows = app.get('workflows');

    /*
     * @name Individual Content Type Approval Page
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     * @param {object} next - Express callback
    */
    app.get(`/${config.content.base}/:type/:id/:revision/${config.content.actions.approve}`, (req, res, next) => {
      const good = utils.content.check.url(req, types, allFlows);

      if (typeof good === 'string') {
        _.set(req.session, '404', {
          message: good,
          safe: `/${config.content.base}`,
        });

        return next();
      }

      const type = good.type;
      const workflow = good.workflow;

      const errors = _.get(req.session, `form.content.approve[${req.params.type.toLowerCase()}].errors`, {});
      const values = _.get(req.session, `form.content.approve[${req.params.type.toLowerCase()}].content`, {});
      const steps = (JSON.parse(JSON.stringify(workflow.steps))).reverse();

      _.unset(req.session, 'form.content.approve');

      _.set(req.session, 'referrer', req.get('Referrer'));

      return database(`content-type--${type.id}`)
        .select('*')
        .where('revision', req.params.revision)
        .where('id', req.params.id)
        .then(rws => {
          if (rws.length < 1) {
            _.set(req.session, '404', {
              message: config.content.messages.missing.revision.replace('%revision', req.params.revision).replace('%type', req.params.type).replace('%id', req.params.id),
              safe: `/${config.content.base}/${req.params.type}`,
            });

            return next();
          }

          // add the previous session data back in
          _.set(req.session, 'form.content.approve', {
            [req.params.type.toLowerCase()]: {
              revision: req.params.revision,
              id: req.params.id,
            },
          });

          // add itentifier to each row
          const rows = utils.routes.identifier(rws, type);

          const revision = rows[0];

          // grab values from response
          const data = revision.value;

          // clear extraneous values
          const remove = ['sunrise-date', 'sunrise-time', 'sunset-time', 'sunset-date', 'submit', 'action', 'comment-textarea'];
          remove.forEach(rmv => {
            delete data[rmv];
          });

          // grab the number for the next step in approval workflow
          const approval = revision.approval - 1;

          // if below zero, this content is already approved
          if (approval < 0) {
            _.set(req.session, '404', {
              message: config.workflows.messages.approved,
              safe: `/${config.content.base}/${req.params.type}`,
            });

            return next();
          }

          // grab the the next step in approval workflow
          const step = steps[approval];

          return workflows.model().then(model => {
            return content.only('workflow', values, model).then(merged => {
              return content.form(merged, errors).then(form => {
                res.render('content/approval', {
                  title: `${config.content.actions.approve} :: ${req.params.type}`,
                  form,
                  action: `/${config.content.base}/${req.params.type.toLowerCase()}/${config.content.actions.approve}`,
                  revision,
                  data,
                  type,
                  config: config.content,
                  step,
                });
              });
            });
          }).catch(error => {
            next(error);
          });
        });
    });

    /*
     * @name Save - Post to Workflows
     * Save workflow to db
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     * @param {object} next - Express callback
    */
    app.post(`/${config.content.base}/:type/${config.content.actions.approve}`, (req, res, next) => {
      const good = utils.content.check.url(req, types, allFlows);

      if (typeof good === 'string') {
        _.set(req.session, '404', {
          message: good,
          safe: `/${config.content.base}`,
        });

        return next();
      }

      const type = good.type;
      const workflow = good.workflow;

      const revision = _.get(req.session, `form.content.approve[${req.params.type.toLowerCase()}].revision`, {});
      const referrer = _.get(req.session, 'referrer') || `/${config.content.base}/${req.params.type.toLowerCase()}`;

      _.unset(req.session, 'referrer');

      return workflows.model().then(model => {
        return content.only('workflow', {}, model).then(merged => {
          // validate audit entry
          const validated = content.form.validate(req.body, merged);

          if (validated === true) {
            // grab the current workflow entries from the database
            return database(`content-type--${type.id}`).select('*').where('revision', revision).then(rows => {
              const rev = rows[0];
              const audits = workflows.audits(rev, workflow, req);

              return database(`content-type--${req.params.type.toLowerCase()}`)
                .where('revision', '=', parseInt(revision, 10))
                .update(audits);
            }).then(() => {
              _.unset(req.session, 'form.content.approve');
              res.redirect(referrer);
            }).catch(e => {
              next(e);
            });
          }

          _.set(req.session, 'form.content.approve', {
            [req.params.type.toLowerCase()]: {
              errors: validated,
              content: utils.format(req.body),
            },
          });

          return res.redirect(referrer);
        });
      });
    });

    resolve(app);
  });
};

module.exports = routes;
