'use strict';

/**
 * @fileoverview Content system routing functions
 *
 */
const config = require('config');
const content = require('punchcard-content-types');
const _ = require('lodash');

const database = require('../database');
const utils = require('../utils');
const workflows = require('../workflows');

/**
 * All Content-Types Landing page
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {object} types all content types available to the CMS
 */
const all = (req, res, types) => {
  res.render('content/home', {
    content: {
      home: config.content.home,
      base: config.content.base,
      types,
    },
  });
};

/**
 * Individual Content-Types Landing page
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {object} next - Express callback
 * @param {object} types - all content types available to the CMS
 *
 * @returns {promise} database promise returned
 */
const one = (req, res, next, types) => {
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
        content: rows,
        type,
        config: config.content,
      });
    });
};

/**
 * Content-Types Add-new-content form
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {object} next - Express callback
 * @param {object} types - all content types available to the CMS
 * @param {object} flows - all workflows available to the CMS
 *
 * @returns {promise} content types form promise returned
 */
const add = (req, res, next, types, flows) => {
  const type = utils.singleItem('id', req.params.type.toLowerCase(), types);
  const workflow = workflows.workflow(type, flows, config, req);
  const errors = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].errors`, {});
  const values = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].content`, {});

  _.unset(req.session, 'form.content.add');

  // check type exists
  if (!utils.content.check.type(req, type)) {
    return next();
  }

  // check workflow exists
  if (!workflow) {
    return next();
  }

  const steps = _.cloneDeep(workflow).steps.reverse();
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
};


module.exports = {
  all,
  one,
  add,
};
