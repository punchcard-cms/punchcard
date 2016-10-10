'use strict';

/*
 * @fileoverview Content system routing
 *
 */
const config = require('config');
const types = require('punchcard-content-types');
const multipart = require('connect-multiparty');
const uuid = require('uuid');
const _ = require('lodash');

const utils = require('../utils');
const database = require('../database');
const workflows = require('../workflows');
const schedule = require('../schedule');

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
    const references = app.get('references');

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
          types: req.content.types,
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
    app.get(`/${config.content.base}/:type`, (req, res) => {
      return database
        .distinct(database.raw('ON (id) id'))
        .select('*')
        .from(`content-type--${req.content.type.id}`)
        .orderBy('id', 'DESC')
        .orderBy('revision', 'DESC').then(rws => {
          // add itentifier to each row
          const rows = utils.routes.identifier(rws, req.content.type);

          res.render('content/landing', {
            title: config.content.base,
            content: rows,
            type: req.content.type,
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
      const errors = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].errors`, {});
      const values = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].content`, {});

      _.unset(req.session, 'form.content.add');

      const steps = _.cloneDeep(req.content.workflow).steps.reverse();
      const step = steps[steps.length - 1];

      return utils.fill(req.content.types, req.content.type, references, database).then(ct => {
        return types.only(req.params.type.toLowerCase(), values, [ct], config).then(merged => {
          return types.form(merged, errors, config).then(form => {
            res.render('content/add', {
              form,
              action: `/${config.content.base}/${req.params.type.toLowerCase()}/${config.content.actions.save}`,
              type: ct,
              config: config.content,
              step,
            });
          });
        }).catch(e => {
          next(e);
        });
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
      return database
        .select('*')
        .from(`content-type--${req.content.type.id}`)
        .where('id', req.params.id)
        .orderBy('revision', 'DESC').then(rws => {
          if (rws.length < 1) {
            const err = {
              message: config.content.messages.missing.id.replace('%type', req.params.type).replace('%id', req.params.id),
              safe: `/${config.content.base}/${req.params.type}`,
              status: 404,
            };

            return next(err);
          }

          // add itentifier to each row
          const rows = utils.routes.identifier(rws, req.content.type);

          res.render('content/content', {
            title: config.content.messages.content.title.replace('%id', req.params.id),
            content: rows,
            type: req.content.type,
            workflow: _.cloneDeep(req.content.workflow).steps.reverse(),
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
      return database
        .select('*')
        .from(`content-type--${req.content.type.id}`)
        .where('revision', req.params.revision)
        .orderBy('revision', 'DESC').then(rws => {
          if (rws.length < 1) {
            const err = {
              message: config.content.messages.missing.revision.replace('%revision', req.params.revision).replace('%type', req.params.type).replace('%id', req.params.id),
              safe: `/${config.content.base}/${req.params.type}`,
              status: 404,
            };

            return next(err);
          }

          // add itentifier to each row
          const rows = utils.routes.identifier(rws, req.content.type);

          res.render('content/content', {
            title: config.content.messages.revisions.title.replace('%revision', req.params.revision).replace('%id', req.params.id),
            content: rows,
            type: req.content.type,
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
      const errors = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].errors`, {});
      const idSess = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].id`, {});
      const revisionSess = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].revision`, {});
      const values = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].content`, {});
      let data = {};

      const steps = _.cloneDeep(req.content.workflow).steps.reverse();

      // new revision, re-start workflow process
      const step = steps[steps.length - 1];

      _.unset(req.session, 'form.content.add');
      _.set(req.session, 'referrer', req.get('Referrer'));

      // something went wrong on save:
      if (Object.keys(values).length > 0) {
        // add the previous session data back in
        _.set(req.session, 'form.content.add', {
          [req.params.type.toLowerCase()]: {
            id: idSess,
            revision: revisionSess,
          },
        });

        return utils.fill(req.content.types, req.content.type, references, database).then(ct => {
          return types.only(req.params.type.toLowerCase(), values, [ct], config).then(merged => {
            return types.form(merged, errors, config).then(form => {
              res.render('content/add', {
                form,
                action: `/${config.content.base}/${req.params.type.toLowerCase()}/${config.content.actions.save}`,
                type: ct,
                step,
                config: config.content,
              });
            });
          }).catch(e => {
            next(e);
          });
        });
      }

      // eslint mad if no return, then mad at this else if it is there
      else { // eslint-disable-line no-else-return
        return utils.fill(req.content.types, req.content.type, references, database).then(ct => {
          // Search for the revision
          return database(`content-type--${ct.id}`).where({
            id: req.params.id,
            revision: req.params.revision,
          }).then(rows => {
            if (rows.length < 1) {
              const err = {
                message: config.content.messages.missing.revision.replace('%type', req.params.type).replace('%id', req.params.id).replace('%revision', req.params.revision),
                safe: `/${config.content.base}/${req.params.type}`,
                status: 404,
              };

              return next(err);
            }
            data = rows[0].value;

            // add session data for this content
            _.set(req.session, 'form.content.add', {
              [req.params.type.toLowerCase()]: {
                id: rows[0].id,
                revision: rows[0].revision,
              },
            });

            return types.only(ct.id, data, [ct], config);
          }).then(only => {
            return types.form(only, null, config);
          }).then(form => {
            res.render('content/add', {
              form,
              action: `/${config.content.base}/${req.params.type.toLowerCase()}/${config.content.actions.save}`,
              type: ct,
              data,
              step,
              config: config.content,
            });
          }).catch(e => {
            next(e);
          });
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
      const referrer = _.get(req.session, 'referrer') || `/${config.content.base}/${req.params.type.toLowerCase()}`;
      let audits;
      let publishable = false;
      let check = 'publish';

      _.unset(req.session, 'referrer');

      if (req.body.submit === config.content.actions.new) {
        check = 'save';
      }

      // Validation
      const validated = types.form.validate(req.body, req.content.type, check);

      if (validated === true) {
        // Publishable
        if (check === 'publish') {
          publishable = true;
        }
        else if (types.form.validate(req.body, req.content.type, 'publish') === true) {
          publishable = true;
        }

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
        const steps = _.cloneDeep(req.content.workflow).steps.reverse();
        const approval = steps.length - 1;
        const request = _.clone(req, true);
        const rev = {
          approval,
        };
        const self = req.content.workflow.steps[approval].hasOwnProperty('self') && req.content.workflow.steps[approval].self === true;

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

        audits = workflows.audits(rev, req.content.workflow, request);

        const data = utils.format(req.body);

        const insert = {
          id,
          language,
          sunrise,
          sunset,
          publishable,
          value: data,
          author: req.user.id,
        };

        return database(`content-type--${req.params.type.toLowerCase()}`).insert(_.merge({}, insert, audits)).returning('*').then(revision => {
          const latest = utils.routes.identifier(revision, req.content.type)[0];

          if (latest.publishable && latest.approval === 1) {
            return schedule(latest, req.content.type, req.app.get('applications-apps')).then(() => {
              return latest;
            });
          }

          return latest;
        }).then((latest) => {
          _.set(req.session, 'form.content.recent', {
            [req.params.type.toLowerCase()]: {
              id: latest.id,
              revision: latest.revision,
            },
          });
          res.redirect(referrer);
        }).catch(e => {
          next(e);
        });
      }

      // eslint mad if no return, then mad at this else if it is there
      else { // eslint-disable-line no-else-return
        _.set(req.session, 'form.content.add', {
          [req.params.type.toLowerCase()]: {
            errors: validated,
            content: utils.format(req.body),
          },
        });
        res.redirect(referrer || req.get('Referrer'));
      }

      return true;
    });

    resolve(app);
  });
};

module.exports = routes;
