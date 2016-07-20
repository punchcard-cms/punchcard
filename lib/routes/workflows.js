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
const croutes = require('./content');
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
    const allflows = app.get('workflows');

    /*
     * @name Individual Content Type Approval Page
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     * @param {object} next - Express callback
    */
    app.get(`/${config.content.base}/:type/:id/:revision/${config.content.actions.approve}`, (req, res, next) => {
      const type = utils.singleItem('id', req.params.type.toLowerCase(), types);
      const workflow = utils.workflow(type, allflows, config, req);
      const errors = _.get(req.session, `form.content.approve[${req.params.type.toLowerCase()}].errors`, {});
      let values = _.get(req.session, `form.content.approve[${req.params.type.toLowerCase()}].content`, {});

      // check type exists
      if (!croutes.check.type(req, type)) {
        return next();
      }

      // id in url is not UUID
      if (!croutes.check.id(req)) {
        return next();
      }

      // revision in url is not a number
      if (!croutes.check.revision(req)) {
        return next();
      }

      // check workflow exists
      if (!workflow) {
        return next();
      }

      const steps = (JSON.parse(JSON.stringify(workflow.steps))).reverse();

      _.unset(req.session, 'form.content.approve');

      values = utils.config(values);

      return database(`content-type--${type.id}`)
        .select('*')
        .where('revision', req.params.revision)
        .where('id', req.params.id)
        .then(rows => {
          if (rows.length < 1) {
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

          const revision = rows[0];

          // grab values from response
          const data = revision.value;

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

          return workflows().then(wf => {
            return content.only('workflow', values, wf).then(merged => {
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
      const type = utils.singleItem('id', req.params.type.toLowerCase(), types);
      const revision = _.get(req.session, `form.content.approve[${req.params.type.toLowerCase()}].revision`, {});
      const workflow = utils.workflow(type, allflows, config);
      let step;
      let approval;
      let publishable = false;
      let action;

      // check type exists
      if (!croutes.check.type(req, type)) {
        return next();
      }

      // check workflow exists
      if (!workflow) {
        return next();
      }

      return workflows().then(wflow => {
        return content.only('workflow', {}, wflow).then(wf => {
          // validate audit entry
          const validated = content.form.validate(req.body, wf);

          if (validated === true) {
            // grab the current workflow entries from the database
            return database(`content-type--${type.id}`).select('*').where('revision', revision).then(rows => {
              const rev = rows[0];
              let audits = rev.audit;

              // no flow entries exist, action is submit
              if (!audits) {
                action = 'submit';
                audits = { entries: [] };
                step = workflow.steps.length - 1;
              }
              else {
                action = req.body['action--select'];
                step = rev.approval;
                if (action === 'approve') {
                  step--;
                }
              }
              approval = step;

              // create the step object
              const data = {
                comment: req.body['comment--textarea'],
                action,
                step,
                author: req.user.id,
                created: utils.time.input(Date.now(), 'America/New_York'),
              };
              audits.entries.push(data);

              // if they are allowed to self publish
              if (workflow.steps[step].hasOwnProperty('self') && workflow.steps[step].self === true) {
                audits.entries.push({
                  comment: req.body['comment--textarea'],
                  action: 'publish',
                  step: 0,
                  author: req.user.id,
                  created: utils.time.input(Date.now(), 'America/New_York'),
                });
                approval = 0;
              }

              // if approval is zero, it's publishable
              if (approval === 0) {
                publishable = true;
              }

              return database(`content-type--${req.params.type.toLowerCase()}`)
                .where('revision', '=', parseInt(revision, 10))
                .update({
                  audit: audits,
                  approval,
                  publishable,
                });
            }).then(() => {
              _.unset(req.session, 'form.content.approve');
              res.redirect(`/${config.content.base}/${req.params.type}`);
            }).catch(e => {
              next(e);
            });
          }

          // eslint thinks the return above ruins this else
          else { // eslint-disable-line no-else-return
            const referrer = req.get('Referrer');
            _.set(req.session, 'form.content.approve', {
              [req.params.type.toLowerCase()]: {
                errors: validated,
                content: req.body,
              },
            });

            return res.redirect(referrer);
          }
        });
      });
    });

    resolve(app);
  });
};

module.exports = routes;
