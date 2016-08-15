'use strict';

/**
 * @fileoverview Content system routing functions
 *
 */
const config = require('config');

const database = require('../database');
const utils = require('../utils');

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


module.exports = {
  all,
  one,
};
