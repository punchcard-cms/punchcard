'use strict';

/**
 * @fileoverview Content system routing functions
 *
 */
const config = require('config');
const types = require('punchcard-content-types');
const _ = require('lodash');

const database = require('../database');
const utils = require('../utils');

/**
 * All Content-Types Landing page
 * @param {object} res - HTTP Response
 * @param {object} allTypes all content types available to the CMS
 */
const all = (res, allTypes) => {
  res.render('content/home', {
    content: {
      home: config.content.home,
      base: config.content.base,
      types: allTypes,
    },
  });
};

/**
 * Individual Content-Types Landing page
 * @param {object} res - HTTP Response
 * @param {object} type - Content type configuration, after merged with input plugins
 *
 * @returns {promise} database promise returned
 */
const one = (res, type) => {
  return database
    .distinct(database.raw('ON (id) id'))
    .select('*')
    .from(`content-type--${type.id}`)
    .orderBy('id', 'DESC')
    .orderBy('revision', 'DESC').then(rws => {
      // add itentifier to each row
      const rows = utils.routes.identifier(rws, type);

      return res.render('content/landing', {
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
 * @param {object} type - Content type configuration, after merged with input plugins
 * @param {object} workflow - workflow configuration
 *
 * @returns {promise} content types form promise returned
 */
const add = (req, res, type, workflow) => {
  const errors = _.get(req.session, `form.content.add[${type.id}].errors`, {});
  const values = _.get(req.session, `form.content.add[${type.id}].content`, {});

  _.unset(req.session, 'form.content.add');

  const steps = _.cloneDeep(workflow).steps.reverse();
  const step = steps[steps.length - 1];

  return types.only(type.id, values, [type]).then(merged => {
    return types.form(merged, errors).then(form => {
      res.render('content/add', {
        form,
        action: req.url.replace(config.content.actions.add, config.content.actions.save),
        type,
        config: config.content,
        step,
      });
    });
  });
};

module.exports = {
  all,
  one,
  add,
};
