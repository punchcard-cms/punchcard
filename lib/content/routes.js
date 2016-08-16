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
const workflows = require('../workflows');

/**
 * All Content-Types Landing page
 * @param {object} req - HTTP Request
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
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {object} next - Express callback
 * @param {object} allTypes - all content types available to the CMS
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

      res.render('content/landing', {
        content: rows,
        type,
        config: config.content,
      });
      return true;
    });
};

/**
 * Content-Types Add-new-content form
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {object} next - Express callback
 * @param {object} allTypes - all content types available to the CMS
 * @param {object} allFlows - all workflows available to the CMS
 *
 * @returns {promise} content types form promise returned
 */
const add = (req, res, next, allTypes, allFlows) => {
  console.log(allTypes);
  console.log(allFlows);
  console.log(req.session);
  const type = utils.singleItem('id', req.params.type.toLowerCase(), allTypes);

  // check type exists
  if (!utils.content.check.type(req, type)) {
    console.log('HERER DAMMIT');
    console.log(utils.content.check.type(req, type));

    return next();
  }
  console.log('HERER DAMMIT TOO');

  // const workflow = workflows.workflow(type, allFlows, config, req);

  // // check workflow exists
  // if (!workflow) {
  //   return next();
  // }

  // const errors = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].errors`, {});
  // const values = _.get(req.session, `form.content.add[${req.params.type.toLowerCase()}].content`, {});

  // _.unset(req.session, 'form.content.add');

  // const steps = _.cloneDeep(workflow).steps.reverse();
  // const step = steps[steps.length - 1];

  // return types.only(req.params.type.toLowerCase(), values, [type]).then(merged => {
  //   return types.form(merged, errors).then(form => {
  //     res.render('content/add', {
  //       form,
  //       action: req.url.replace(config.content.actions.add, config.content.actions.save),
  //       type,
  //       config: config.content,
  //       step,
  //     });
  //   });
  // }).catch(e => {
  //   next(e);
  // });
};

/**
 * Content-Types Add-new-content form
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {object} next - Express callback
 * @param {object} allTypes - all content types available to the CMS
 * @param {object} allFlows - all workflows available to the CMS
 *
 * @returns {promise} content types form promise returned
 */
const content = (req, res, next, allTypes, allFlows) => {
  const type = utils.singleItem('id', req.params.type.toLowerCase(), allTypes);

  // check type exists
  if (!utils.content.check.type(req, type)) {
    return next();
  }

  const workflow = workflows.workflow(type, allFlows, config);

  // check workflow exists
  if (!workflow) {
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
        workflow: _.cloneDeep(workflow).steps.reverse(),
        config: config.content,
      });

      return true;
    });
};

module.exports = {
  all,
  one,
  add,
  content,
};
