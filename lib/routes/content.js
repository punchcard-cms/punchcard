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
const workflows = require('../workflows');

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
    const allflows = app.get('workflows');

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

      // check type exists
      if (!utils.content.check.type(req, type)) {
        return next();
      }

      return database
        .distinct(database.raw('ON (id) id'))
        .select('*')
        .from(`content-type--${type.id}`)
        .orderBy('id', 'DESC')
        .orderBy('revision', 'DESC').then(rws => {
          // add itentifier to each row
          const rows = utils.routes.identifier(rws, type);

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
      const workflow = workflows.workflow(type, allflows, config, req);
      const errors = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].errors`, {});
      let values = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].content`, {});

      _.unset(req.session, 'form.content.add');

      values = utils.config(values);

      // check type exists
      if (!utils.content.check.type(req, type)) {
        return next();
      }

      // check workflow exists
      if (!workflow) {
        return next();
      }

      const steps = (JSON.parse(JSON.stringify(workflow.steps))).reverse();
      const step = steps[steps.length - 1];

      return content.only(req.params.type.toLowerCase(), values, [type]).then(merged => {
        return content.form(merged, errors).then(form => {
          res.render('content/add', {
            form,
            action: req.url.replace(config.content.actions.add, config.content.actions.save),
            type,
            config: config.content,
            step,
          });
        });
      }).catch(e => {
        next(e);
      });
    });

    /*
     * @name Individual Piece of Content
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     * @param {object} next - Express callback
    */
    app.get(`/${config.content.base}/:type/:id`, (req, res, next) => {
      const type = utils.singleItem('id', req.params.type.toLowerCase(), types);

      // check type exists
      if (!utils.content.check.type(req, type)) {
        return next();
      }

      // id in url is not UUID
      if (!utils.content.check.id(req)) {
        return next();
      }

      return database
        .select('*')
        .from(`content-type--${type.id}`)
        .where('id', req.params.id)
        .orderBy('revision', 'DESC').then(rws => {
          if (rws.length < 1) {
            _.set(req.session, '404', {
              message: config.content.messages.missing.id.replace('%type', req.params.type).replace('%id', req.params.id),
              safe: `/${config.content.base}/${req.params.type}`,
            });

            return next();
          }

          // add itentifier to each row
          const rows = utils.routes.identifier(rws, type);

          res.render('content/content', {
            title: config.content.messages.content.title.replace('%id', req.params.id),
            content: rows,
            type,
            config: config.content,
          });

          return true;
        });
    });

    /*
     * @name Specific revision of an Individual Piece of Content
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     * @param {object} next - Express callback
    */
    app.get(`/${config.content.base}/:type/:id/:revision`, (req, res, next) => {
      const type = utils.singleItem('id', req.params.type.toLowerCase(), types);

      // check type exists
      if (!utils.content.check.type(req, type)) {
        return next();
      }

      // id in url is not UUID
      if (!utils.content.check.id(req)) {
        return next();
      }

      // revision in url is not a number
      if (!utils.content.check.revision(req)) {
        return next();
      }

      return database
        .select('*')
        .from(`content-type--${type.id}`)
        .where('revision', req.params.revision)
        .orderBy('revision', 'DESC').then(rws => {
          if (rws.length < 1) {
            _.set(req.session, '404', {
              message: config.content.messages.missing.revision.replace('%revision', req.params.revision).replace('%type', req.params.type).replace('%id', req.params.id),
              safe: `/${config.content.base}/${req.params.type}`,
            });

            return next();
          }

          // add itentifier to each row
          const rows = utils.routes.identifier(rws, type);

          res.render('content/content', {
            title: config.content.messages.revisions.title.replace('%revision', req.params.revision).replace('%id', req.params.id),
            content: rows,
            type,
            config: config.content,
          });

          return true;
        });
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
      const workflow = workflows.workflow(type, allflows, config, req);
      const errors = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].errors`, {});
      const idSess = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].id`, {});
      const revisionSess = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].revision`, {});
      let values = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].content`, {});
      let data = {};

      // check type exists
      if (!utils.content.check.type(req, type)) {
        return next();
      }

      // id in url is not UUID
      if (!utils.content.check.id(req)) {
        return next();
      }

      // revision in url is not a number
      if (!utils.content.check.revision(req)) {
        return next();
      }

      // check workflow exists
      if (!workflow) {
        return next();
      }

      const steps = (JSON.parse(JSON.stringify(workflow.steps))).reverse();

      // new revision, re-start workflow process
      const step = steps[steps.length - 1];

      _.unset(req.session, 'form.content.add');

      values = utils.config(values);

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
              action: `/${config.content.base}/${req.params.type}/${config.content.actions.save}`,
              type,
              step,
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
        return database(`content-type--${type.id}`).where({
          id: req.params.id,
          revision: req.params.revision,
        }).then(rows => {
          if (rows.length < 1) {
            _.set(req.session, '404', {
              message: config.content.messages.missing.revision.replace('%type', req.params.type).replace('%id', req.params.id).replace('%revision', req.params.revision),
              safe: `/${config.content.base}/${req.params.type}`,
            });

            return next();
          }
          data = rows[0].value;

          // add session data for this content
          _.set(req.session, 'form.content.add', {
            [req.params.type.toLowerCase()]: {
              id: rows[0].id,
              revision: rows[0].revision,
            },
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
            step,
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
      const workflow = workflows.workflow(type, allflows, config);
      let audits;
      let check = 'publish';

      // check type exists
      if (!utils.content.check.type(req, type)) {
        return next();
      }

      // check workflow exists
      if (!workflow) {
        return next();
      }

      if (req.body.submit === 'Save Revision') {
        check = 'save';
      }

      // Validation
      const validated = content.form.validate(req.body, type, check);

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

        // approval step returns to first step after saving a new revision
        const steps = (JSON.parse(JSON.stringify(workflow.steps))).reverse();
        const approval = steps.length - 1;
        const request = _.clone(req, true);
        const rev = {
          approval,
        };
        const self = workflow.steps[approval].hasOwnProperty('self') && workflow.steps[approval].self === true;

        if (self) {
          rev.approval++;
        }

        if (check === 'publish') {
          if (self) {
            request.body['comment-textarea'] = 'Self published';
            request.body['action--select'] = 'self-published';
          }
          else {
            request.body['comment-textarea'] = 'content submitted';
            request.body['action--select'] = 'submit';
          }
        }

        audits = workflows.audits(rev, workflow, request);

        const data = utils.format(req.body);

        const insert = {
          id,
          language,
          sunrise,
          sunset,
          value: data,
          author: req.user.id,
        };

        return database(`content-type--${req.params.type.toLowerCase()}`).insert(_.merge({}, insert, audits)).returning(['id', 'revision']).then((latest) => {
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

      // eslint mad if no return, then mad at this else if it is there
      else { // eslint-disable-line no-else-return
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
