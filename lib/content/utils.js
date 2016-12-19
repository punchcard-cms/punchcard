'use strict';

const config = require('config');
const _ = require('lodash');
const path = require('path');
const isUUID = require('validator/lib/isUUID');

/**
 * Determine file inputs from a set of content type attributes
 *
 * @param  {object} attributes - content type attributes
 *
 * @return {array} array of objects describing file inputs
 */
const fileinputs = attributes => {
  const attrs = attributes;

  if (!attrs || !Array.isArray(attrs)) {
    return [];
  }

  // find all file inputs
  const filers = attrs.map(attr => {
    let inputs = attr.inputs;

    // compensates for array of inputs, this is a bug: https://github.com/punchcard-cms/content-types/issues/133
    if (Array.isArray(attr.inputs)) {
      inputs = attr.inputs[0];
    }

    return Object.keys(inputs).filter(input => {
      return inputs[input].type === 'file'; // only want file inputs
    }).map(input => {
      const parts = inputs[input].name.split('--');

      return {
        'attr': attr.id,
        'input': parts[parts.length - 1],
        'type': inputs[input].type,
      };
    });
  }).filter(filer => {
    return filer.length > 0;
  });

  const final = [];

  filers.forEach(filer => {
    filer.forEach(filr => {
      final.push(filr);
    });
  });

  return final || [];
}

/**
 * Add absolute path for files and add the path to the data object
 *
 * @param  {array} files - array of file input data
 * @param  {object} data - content object
 *
 * @return {object} data - content object with absolute paths for files
 */
const filepaths = (files, data) => {
  const content = data;

  if (Array.isArray(files) && files.length > 0) {
    files.forEach(filer => {
      // if repeatable
      if (Array.isArray(content[filer.attr][filer.input])) {
        content[filer.attr][filer.input] = content[filer.attr][filer.input].map(atr => {
          const attr = atr;

          if (attr.value.hasOwnProperty('original') && attr.value.original !== '') {
            attr.value.absolute = path.join(config.storage.public, attr.value.relative);
          }

          return attr;
        });
      }
      else {
        // non-repeatables
        if (content[filer.attr] && content[filer.attr][filer.input].value.hasOwnProperty('original') && content[filer.attr][filer.input].value.original !== '') {
          content[filer.attr][filer.input].value.absolute = path.join(config.storage.public, content[filer.attr][filer.input].value.relative);
        }
      }
    });
  }

  return content;
}

const check = {

  /**
   * Determine if an id is in uuid format; update session for error
   *
   * @param {object} req - HTTP Request
   *
   * @returns {boolean} false-not in uuid format / true-it is!
   */
  id: (req) => {
    if ((typeof req.params.id !== 'string') || (!isUUID(req.params.id))) {
      _.set(req.session, '404', {
        message: config.content.messages.format.id,
        safe: `/${config.content.base}`,
      });

      return false;
    }

    return true;
  },

  /**
   * Determine if a revision is a number; update session for error
   *
   * @param {object} req - HTTP Request
   *
   * @returns {boolean} false-not number / true-it is!
   */
  revision: (req) => {
    if (!Number.isInteger(parseInt(req.params.revision, 10))) {
      _.set(req.session, '404', {
        message: config.content.messages.format.revision.replace('%revision', req.params.revision),
        safe: `/${config.content.base}`,
      });

      return false;
    }

    return true;
  },

  /**
   * If type is false, update session for error
   *
   * @param {object} req - HTTP Request
   * @param {object} type - full content type object
   *
   * @returns {boolean} false-not true / true-it is!
   */
  type: (req, type) => {
    if (!type || (type === false) || (typeof type !== 'object') || !type.id || !type.name) {
      _.set(req.session, '404', {
        message: config.content.messages.missing.type.replace('%type', req.params.type),
        safe: `/${config.content.base}`,
      });

      return false;
    }

    return true;
  },
};

module.exports = {
  fileinputs,
  filepaths,
  check,
};
