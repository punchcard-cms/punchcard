'use strict';

/*
 * @fileoverview Dummy content for the live API db
 *
 */
const ipsum = require('lorem-ipsum');
const slugify = require('underscore.string/slugify');
const uuid = require('uuid');

const merged = require('./types-models-merged');
const utils = require('../../../../lib/utils');

const rows = [];
let id = '';

for (let i = 0; i < 50; i++) {
  const name = ipsum({
    count: 3,
    units: 'words',
    format: 'plain',
  });


  const sunrise = `${Math.round(Math.random() * 3 + 2016)}-${Math.round(Math.random() * 11 + 1)}-${Math.round(Math.random() * 25 + 1)}`;
  const sunset = `${Math.round(Math.random() * 3 + 2016)}-${Math.round(Math.random() * 11 + 1)}-${Math.round(Math.random() * 25 + 1)}`;

  const type = merged.allTypes[Math.round(Math.random() * 4)];

  merged.eachOfType[type.name] += 1;

  const attributes = {};
  attributes[`${type.id}-name`] = {
    text: {
      value: ipsum({
        count: 1,
        units: 'words',
        format: 'plain',
      }),
    },
  };
  attributes[`${type.id}-textblock`] = {
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
  attributes[`${type.id}-referencer`] = {
    referencer: {
      value: id,
    },
  };

  id = uuid.v4();

  const item = {
    id,
    language: 'en-us',
    sunrise: utils.time.iso(sunrise, '00:00'),
    sunset: utils.time.iso(sunset, '00:00'),
    key: name,
    'key-slug': slugify(name),
    type: type.name,
    'type-slug': slugify(type.name),
    attributes,
  };

  rows[i] = item;
}


module.exports = {
  eachOfType: merged.eachOfType,
  rows,
};
