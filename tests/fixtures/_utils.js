'use strict'; // eslint-disable-line strict

/*
 * Utility Files for Tests
 */

const ipsum = require('lorem-ipsum');
const uuid = require('uuid');
const slugify = require('underscore.string/slugify');
const moment = require('moment');

const utils = require('../../lib/utils');

/**
 * Content type model after merged with input plugins via content-types module
 * @typedef {Object} type
 * @property {string} name - name of content type
 * @property {string} id - id of content type
 * @property {string} description - description of content type
 * @property {array} attributes - input attributes
 */

/**
 * array of content types
 * @typedef {array} allTypes
 */

/**
 * Object which tracks the number of pieces of content for each content type
 * @typedef {array} eachOfType
 */

/*
 * Randomly generate content
 */
const generate = (total, lang) => {
  const content = [];
  const lives = [];
  const types = [];
  const eachOfType = {};
  const allTypes = [];
  const t = total || 50;
  const language = lang || 'en-us';
  let i;


  /**
   * Populate an array {allTypes} of content types {type}
   */
  for (i = 0; i < 5; i++) {
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
          id: `${slugify(types[i])}-name`,
          type: 'text',
        },
        {
          name: 'Textblock',
          inputs: {
            textblock: {
              label: 'Text',
              type: 'textarea',
              id: uuid.v4(),
              name: 'textblock--textarea',
            },
          },
          id: `${slugify(types[i])}-textblock`,
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
          id: `${slugify(types[i])}-referencer`,
          type: 'reference',
        },
      ],
    });
  }

  /**
   * Add {type} fixtures to the content array
   */
  for (i = 0; i < t; i++) {
    let referenced = '';
    const name = ipsum({
      count: 3,
      units: 'words',
      format: 'plain',
    });

    const id = uuid.v4();
    const date = moment().format('YYYY-MM-DD');

    const sunrise = moment().format('hh:mm');
    const sunset = moment().format('hh:mm');

    const type = types[Math.round(Math.random() * 4)];

    eachOfType[type] += 1;

    if (content.length > 0) {
      // make the last entry the referencee
      referenced = content[content.length - 1].id;
    }

    const values = {};
    values[`${slugify(type)}-name`] = {
      text: {
        value: ipsum({
          count: 1,
          units: 'words',
          format: 'plain',
        }),
      },
    };
    values[`${slugify(type)}-textblock`] = {
      textblock: {
        value: ipsum({
          count: 2,
          units: 'paragraphs',
          format: 'plain',
          sentenceUpperBound: 5,
          paragraphUpperBound: 3,
        }),
      },
    };
    values[`${slugify(type)}-referencer`] = {
      referencer: {
        value: referenced,
      },
    };

    const item = {
      id,
      language,
      'revision': Math.round(Math.random() * 40),
      'sunrise': utils.time.iso(date, sunrise, 'America/New_York'),
      'sunrise-timezone': 'America/New_York',
      'sunset': Date.now() % 6 === 0 ? utils.time.iso(date, sunset, 'America/New_York') : null,
      'sunset-timezone': 'America/New_York',
      'identifier': name,
      'slug': slugify(name),
      type,
      'type-slug': slugify(type),
      'value': values,
    };

    content[i] = item;

    const live = {
      id,
      language,
      'sunrise': utils.time.iso(date, sunrise, 'America/New_York'),
      'sunset': Date.now() % 6 === 0 ? utils.time.iso(date, sunset, 'America/New_York') : null,
      'attributes': values,
      'key': name,
      'key-slug': slugify(name),
      type,
      'type-slug': slugify(type),
      'revision': Math.round(Math.random() * 40),
    };

    lives[i] = live;
  }

  return {
    content,
    live: lives,
    types: {
      names: types,
      each: eachOfType,
      full: allTypes,
    },
  };
};

/*
 * Basic validation function
 *
 * @returns true
 */
const validation = function validation() {
  return true;
};

module.exports = {
  generate,
  validation,
};
