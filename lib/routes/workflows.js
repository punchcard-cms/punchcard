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
    const workflows = app.get('workflows');

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

          // add the previous session data back in
          _.set(req.session, 'form.content.approve', {
            [req.params.type.toLowerCase()]: {
              revision: req.params.revision,
            },
          });

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
                  action: `/${config.content.base}/${req.params.type.toLowerCase()}/${config.content.actions.approve}`,
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
      let workflow;
      let step;
      let approval;
      let publishable = false;
      let action;

      _.unset(req.session, 'form.content.approve');

      // get workflow for this content-type
      if (type.workflow) {
        workflow = utils.singleItem('id', type.workflow, workflows);

        if (workflow === false) {
          _.set(req.session, '404', {
            message: config.workflows.messages.missing.replace('%type', req.params.type).replace('%workflow', type.workflow),
            safe: `/${config.content.base}`,
          });

          return next();
        }
      }
      else {
        workflow = utils.singleItem('id', config.workflows.default, workflows);
      }

      // grab the current workflow entries from the database
      return database(`content-type--${type.id}`).select('workflows', 'approval').where('revision', revision).then(rows => {
        if (rows.length < 1) {
          _.set(req.session, '404', {
            message: config.content.messages.missing.revision.replace('%revision', req.params.revision).replace('%type', req.params.type),
            safe: `/${config.content.base}/${req.params.type}`,
          });

          return next();
        }

        const rev = rows[0];
        let flows = rev.workflows;

        // no flow entries exist, action is submit
        if (!flows) {
          action = 'submit';
          flows = { entries: [] };
          step = workflow.steps.length - 1;
        }
        else {
          action = req.body['action--select'];
          step = rev.approval;
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
        flows.entries.push(data);

        // if they are allowed to self publish
        if (workflow.steps[step].hasOwnProperty('self') && workflow.steps[step].self === true) {
          flows.entries.push({
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

        return database(`content-type--${req.params.type.toLowerCase()}`).update({
          workflows: flows,
          approval,
          publishable,
        }).where('revision', revision);
      }).then(() => {
        res.redirect(`/${config.content.base}/${req.params.type}`);
      }).catch(e => {
        next(e);
      });
    });

    resolve(app);
  });
};

module.exports = routes;
