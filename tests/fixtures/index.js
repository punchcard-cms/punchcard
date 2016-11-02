'use strict'; // eslint-disable-line strict

/*
 * Utility Files for Tests
 */

const ipsum = require('lorem-ipsum');
const uuid = require('uuid');
const slugify = require('underscore.string/slugify');
const moment = require('moment');
const _ = require('lodash');

const futils = require('./_utils');

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
  let content = [];
  const lives = [];
  const types = [];
  const refs = {
    types: {},
    content: {},
  };
  const eachOfType = {};
  let allTypes = [];
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
    refs.content[slugify(types[i])] = [];

    allTypes.push(futils.type(types[i]));
  }

  /**
   * Cycle through All Types and give a content-type ID to all references
   */
  allTypes = allTypes.map(tp => {
    const type = tp;
    const others = _.cloneDeep(types).filter(typ => {
      return typ !== type;
    });
    const random = Math.round(Math.random() * Math.round(others.length - 1));

    // go through each attribute and assign a content type for references
    type.attributes = type.attributes.map(atr => {
      const attr = atr;
      Object.keys(attr.inputs).forEach(inp => {
        const input = attr.inputs[inp];
        if (input.hasOwnProperty('reference') && input.hasOwnProperty('settings')) {
          input.settings.contentType = slugify(others[random]);
        }

        attr.inputs[inp] = input;
      });

      return attr;
    });

    // store contentType used by all this type's attributes
    refs.types[type.id] = slugify(others[random]);

    return type;
  });

  // get the number of content types
  let typesnum = types.length - 1;

  /**
   * Add {type} fixtures to the content array
   */
  for (i = 0; i < t; i++) {
    const name = ipsum({
      count: 3,
      units: 'words',
      format: 'plain',
    });

    const id = uuid.v4();
    const date = moment().format('YYYY-MM-DD');

    const sunrise = moment().format('hh:mm');
    const sunset = moment().format('hh:mm');

    if (typesnum < 0) {
      typesnum = types.length - 1;
    }

    // goes through each type (instead of random) to make sure no types are empty
    const type = types[typesnum];
    typesnum--;

    // store id under this content type
    refs.content[slugify(type)].push(id);

    // track number of pieces of content for each type
    eachOfType[type] += 1;

    const values = futils.values(type);

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

  // add referenced UUIDs to content/live
  content = content.map(ct => {
    let cont = ct;
    const live = lives.findIndex(elm => {
      return elm.id === cont.id;
    });

    // get the source of referenced content
    const source = {
      type: refs.types[slugify(ct.type)],
      ids: refs.content[refs.types[slugify(ct.type)]],
    };

    // need a random number to get id
    const random = Math.round(Math.random() * Math.round(source.ids.length - 1));

    // replace every id placeholder wiht a random id from the correct content-type
    const replaced = JSON.stringify(cont, null, 2).replace(/make-me-an-id/g, source.ids[random]);
    cont = JSON.parse(replaced);

    // replace live data too
    lives[live].attributes = cont.value;

    return cont;
  });

// console.log(JSON.stringify(content, null, 2));
// console.log(JSON.stringify(lives, null, 2));

  return {
    content,
    live: lives,
    references: utils.references(allTypes).references,
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
  referencer: futils.referencer,
};
