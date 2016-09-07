'use strict'; // eslint-disable-line strict

/*
 * Utility Files for Tests
 */

const ipsum = require('lorem-ipsum');
const uuid = require('uuid');
const slugify = require('underscore.string/slugify');
const moment = require('moment');

const utils = require('../../lib/utils');

/*
 * Randomly generate content
 */
const generate = total => {
  const content = [];
  const types = [];
  const eachOfType = {};
  const allTypes = [];
  const t = total || 50;
  let i;


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
      attributes: [],
    });
  }

  for (i = 0; i < t; i++) {
    const name = ipsum({
      count: 3,
      units: 'words',
      format: 'plain',
    });

    const date = moment().format('YYYY-MM-DD');

    const sunrise = moment().format('hh:mm');
    const sunset = moment().format('hh:mm');

    const type = types[Math.round(Math.random() * 4)];

    eachOfType[type] += 1;

    const item = {
      'id': uuid.v4(),
      'language': 'en-us',
      'revision': Math.round(Math.random() * 40),
      'sunrise': utils.time.iso(date, sunrise, 'America/New_York'),
      'sunrise-timezone': 'America/New_York',
      'sunset': Date.now() % 6 === 0 ? utils.time.iso(date, sunset, 'America/New_York') : null,
      'sunset-timezone': 'America/New_York',
      'identifier': name,
      'slug': slugify(name),
      type,
      'type-slug': slugify(type),
      'value': {
        name,
        text: ipsum({
          count: 3,
          units: 'paragraphs',
          format: 'html',
        }),
      },
    };

    content[i] = item;
  }

  return {
    content,
    types: {
      names: types,
      each: eachOfType,
      full: allTypes,
    },
  };
};


module.exports = {
  generate,
};
