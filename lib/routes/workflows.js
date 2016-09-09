'use strict';

/*
 * @fileoverview Content system routing
 *
 */
const config = require('config');
const types = require('punchcard-content-types');
const _ = require('lodash');
const moment = require('moment-timezone');

const utils = require('../utils');
const database = require('../database');
const workflows = require('../workflows');
const schedule = require('../schedule');

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
     * @name Individual Content Type Approval Page
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     * @param {object} next - Express callback
    */
    app.get(`/${config.content.base}/:type/:id/:revision/${config.content.actions.approve}`, (req, res, next) => {
      const errors = _.get(req.session, `form.content.approve[${req.params.type.toLowerCase()}].errors`, {});
      const values = _.get(req.session, `form.content.approve[${req.params.type.toLowerCase()}].content`, {});

      const steps = _.cloneDeep(req.content.workflow).steps.reverse();

      _.unset(req.session, 'form.content.approve');

      _.set(req.session, 'referrer', req.get('Referrer'));


      return utils.fill(req.content.types, req.content.type, references, database).then(ct => {
        return database(`content-type--${ct.id}`)
          .select('*')
          .where('revision', req.params.revision)
          .where('id', req.params.id)
          .then(rws => {
            if (rws.length < 1) {
              const err = {
                message: config.content.messages.missing.revision.replace('%revision', req.params.revision).replace('%type', req.params.type).replace('%id', req.params.id),
                safe: `/${config.content.base}/${req.params.type}`,
                status: 404,
              };

              return next(err);
            }

            // add the previous session data back in
            _.set(req.session, 'form.content.approve', {
              [req.params.type.toLowerCase()]: {
                revision: req.params.revision,
                id: req.params.id,
              },
            });

            // add itentifier to each row
            const rows = utils.routes.identifier(rws, ct);

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
              const err = {
                message: config.workflows.messages.approved,
                safe: `/${config.content.base}/${req.params.type}`,
                status: 404,
              };

              return next(err);
            }

            // grab the the next step in approval workflow
            const step = steps[approval];

            const time = {
              sunrise: {
                human: utils.time.input(revision.sunrise, revision['sunrise-timezone']),
                unix: moment(revision.sunrise).unix(),
              },
              sunset: {
                human: utils.time.input(revision.sunset, revision['sunset-timezone']),
                unix: revision.sunset ? moment(revision.sunset).unix() : 0,
              },
              now: moment().unix(),
            };

            let scheduled = [];

            // Get live revision's sunset
            return database('live').select('sunset').where({
              id: revision.id,
              language: revision.language,
            }).then(live => {
              if (live.length > 0) {
                time.sunset.live = {
                  human: utils.time.input(live[0].sunset, revision['sunset-timezone']),
                  unix: live[0].sunset ? moment(live[0].sunset).unix() : 0,
                };
              }

              return live;
            }).then(() => {
              return database('schedule').select('revision').where({
                id: revision.id,
                language: revision.language,
                sunrise: revision.sunrise,
              }).then(items => {
                scheduled = items;

                return workflows.model();
              });
            }).then(model => {
              return types.only('workflow', values, model, config).then(merged => {
                return types.form(merged, errors, config).then(form => {
                  res.render('content/approval', {
                    title: `${config.content.actions.approve} :: ${req.params.type}`,
                    form,
                    action: `/${config.content.base}/${req.params.type.toLowerCase()}/${config.content.actions.approve}`,
                    revision,
                    time,
                    scheduled,
                    data,
                    type: ct,
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
      const revision = _.get(req.session, `form.content.approve[${req.params.type.toLowerCase()}].revision`, {});
      const referrer = _.get(req.session, 'referrer') || `/${config.content.base}/${req.params.type.toLowerCase()}`;
      let working;

      _.unset(req.session, 'referrer');

      return workflows.model().then(model => {
        return types.only('workflow', {}, model, config).then(merged => {
          // validate audit entry
          const validated = types.form.validate(req.body, merged);

          if (validated === true) {
            // grab the current workflow entries from the database
            return database(`content-type--${req.content.type.id}`).select('*').where('revision', revision).then(rows => {
              const rev = rows[0];
              const audits = workflows.audits(rev, req.content.workflow, req);

              working = _.merge({}, rev, audits);

              return database(`content-type--${req.params.type.toLowerCase()}`)
                .where('revision', '=', parseInt(revision, 10))
                .update(audits);
            }).then(() => {
              const latest = utils.routes.identifier([working], req.content.type)[0];

              if (latest.publishable && latest.approval === 0) {
                return schedule(latest, req.content.type).then(() => {
                  return latest;
                });
              }

              return latest;
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
