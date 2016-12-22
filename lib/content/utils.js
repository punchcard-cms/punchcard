'use strict';

const config = require('config');
const _ = require('lodash');

const storage = require('../storage');

/**
 * Determine file inputs from a set of content type attributes
 *
 * @param  {object} attributes - content type attributes
 *
 * @returns {array} array of objects describing file inputs
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
      const parts = _.split(inputs[input].name, '--', 2);
      const checkbox = Object.keys(inputs).filter(ipt => {
        return inputs[ipt].type === 'checkbox'; // only want file input's checkbox
      })
      const repeatable = (attr.hasOwnProperty('repeatable') && typeof attr.repeatable === 'object');

      return {
        attr: attr.id,
        input: parts[parts.length - 1],
        type: inputs[input].type,
        repeatable,
        file: {
          name: `${attr.id}--${input}`,
          input,
        },
        checkbox: {
          name: `${attr.id}--${checkbox}`,
          input: checkbox,
        },
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
};

/**
 * Determine absolute path for files and add the path to the data object
 *
 * @param  {array} files - array of file input data
 * @param  {object} data - content object
 *
 * @returns {object} data - content object with absolute paths to files
 */
const filepaths = (files, data) => {
  const content = data;

  if (Array.isArray(files) && files.length > 0) {
    files.forEach(filer => {
      // if repeatable
      if (Array.isArray(content[filer.attr])) {
        content[filer.attr] = content[filer.attr].map(inpt => {
          const input = inpt;

          if (input[filer.file.input] && input[filer.file.input].hasOwnProperty('value') && input[filer.file.input].value.hasOwnProperty('original') && input[filer.file.input].value.original !== '') {
            input[filer.file.input].value = storage.get(input[filer.file.input].value);
          }

          return input;
        });
      }
      else {
        // non-repeatables
        if (content[filer.attr] && content[filer.attr][filer.file.input] && content[filer.attr][filer.file.input].value.hasOwnProperty('original') && content[filer.attr][filer.file.input].value.original !== '') {
          content[filer.attr][filer.file.input].value = storage.get(content[filer.attr][filer.file.input].value);
        }
      }
    });
  }

  return content;
};

/**
 * Captue files after validation error and add to value
 *
 * @param {array} files - An array of file objects as received from a multi-part form
 * @param {object} val - captured non-file form data
 * @param {object} attributes - content type attributes
 *
 * @returns {object} content values with files added in
 */
const filehold = (files, val, attributes) => {
  const values = val;

  if (!files || !Array.isArray(files) || !values || typeof values !== 'object' || !attributes || typeof attributes !== 'object') {
    return values;
  }

  // get all file inputs from the content type attributes
  const inputs = fileinputs(attributes);

  // Add file paths to data
  if (Array.isArray(inputs) && inputs.length > 0 && Array.isArray(files) && files.length > 0) {
    inputs.forEach(filer => {
      const filedata = files.find(file => {
        return (file.originalname !=='' && file.fieldname === `${filer.attr}--${filer.input}`);
      });

      if (filedata) {
        values[filer.attr] = {
          [filer.input]: {
            value: {
              type: filedata.mimetype,
              original: filedata.originalname,
              path: `${config.storage.temp.public}/${filedata.originalname}`,
            },
          },
        };
      }
      else {
        const repeaters = files.filter(file => {
          return (file.originalname !== '' && file.fieldname.startsWith(`${filer.attr}--${filer.input}--`));
        });

        if (Array.isArray(repeaters) && repeaters.length > 0) {
          if (!values[filer.attr]) {
            values[filer.attr] = [];
          }

          repeaters.forEach(repeater => {
            values[filer.attr].push({
              [filer.input]: {
                value: {
                  type: repeater.mimetype,
                  original: repeater.originalname,
                  path: `${config.storage.temp.public}/${repeater.originalname}`,
                },
              },
            });
          });
        }
      }
    });
  }

  return values;
}


/**
 * Compare files from form against existing data
 *
 * @param {array} files - An array of file objects as received from a multi-part form
 * @param {object} inserted - formatted data object with files, ready for storage
 * @param {object} val - existing data
 * @param {object} attributes - content type attributes
 *
 * @returns {object} content values with files added in
 */
const filecompare = (files, inserted, val, attributes) => {
  const values = val;
  const data = inserted;

  if (!files || !Array.isArray(files) || !data || typeof data !== 'object' || !values || typeof values !== 'object' || !attributes || typeof attributes !== 'object') {
    return values;
  }

  // get all file inputs from the content type attributes
  const finputs = fileinputs(attributes);

  // Add file paths to data
  if (Array.isArray(finputs) && finputs.length > 0) {
    finputs.forEach(finput => {
      const filedata = files.find(file => {
        return (file.originalname !=='' && file.fieldname === `${finput.attr}--${finput.input}`);
      });

      const checkbox = finput.checkbox;
      const input = finput.file;

      if (finput.repeatable) {
        // do repeatable thingies
      }
      else {
        if (!data[checkbox.name] && !filedata) {
          if (!data[finput.attr]) {
            data[finput.attr] = {};
          }

          data[finput.attr][input.input] = val.value[finput.attr][input.input];
        }
      }
    });
  }

  return data;
}

module.exports = {
  fileinputs,
  filepaths,
  filehold,
  filecompare,
};
