'use strict';

/*
 * @fileoverview Content type-related objects and arrays
 *
 */
const ipsum = require('lorem-ipsum');
const slugify = require('underscore.string/slugify');
const uuid = require('uuid');

/**
 * Content type model after merged with input plugins via content-types module
 * @typedef {Object} types
 * @property {string} name - name of content type
 * @property {string} id - id of content type
 * @property {string} description - description of content type
 * @property {array} attributes - input attributes
 */

/**
 * An array of content types
 * @typedef {array} allTypes
 */

const allTypes = [];
const eachOfType = {};
const types = [];

for (let i = 0; i < 5; i++) {
  types.push(`Test Type ${ipsum({
    count: 1,
    units: 'words',
  })}`);
  eachOfType[types[i]] = 0;
  allTypes.push({
    name: types[i],
    id: slugify(types[i]),
    description: ipsum({
      count: Math.round(Math.random() * 6 + 1),
      units: 'words',
    }),
    attributes: [
      {
        name: 'Name',
        inputs: {
          text: {
            label: 'Name',
            type: 'text',
            id: uuid.v4(),
            name: 'name--text',
          },
        },
        id: `${types[i]}-name`,
        type: 'text',
      },
      {
        name: 'Textblock',
        inputs: {
          textblock: {
            label: 'Text',
            type: 'textarea',
            id: uuid.v4(),
            name: 'text--textarea',
          },
        },
        id: `${types[i]}-textblock`,
        type: 'textarea',
      },
      {
        name: 'Referencer',
        inputs: {
          referencer: {
            label: 'Text',
            type: 'reference',
            id: uuid.v4(),
            name: 'referencer--reference',
          },
        },
        id: `${types[i]}-referencer`,
        type: 'reference',
      },
    ],
  });
}

module.exports = {
 allTypes,
 eachOfType,
 types
};
