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

for (let i = 0; i < 50; i++) {
  const name = ipsum({
    count: 3,
    units: 'words',
    format: 'plain',
  });

  const sunrise = `${Math.round(Math.random() * 3 + 2016)}-${Math.round(Math.random() * 11 + 1)}-${Math.round(Math.random() * 25 + 1)}`;
  const sunset = `${Math.round(Math.random() * 3 + 2016)}-${Math.round(Math.random() * 11 + 1)}-${Math.round(Math.random() * 25 + 1)}`;

  const type = merged.types[Math.round(Math.random() * 4)];

  merged.eachOfType[type] += 1;

  const item = {
    'id': uuid.v4(),
    'language': 'en-us',
    'sunrise': utils.time.iso(sunrise, '00:00'),
    'sunset': utils.time.iso(sunset, '00:00'),
    'key': name,
    'key-slug': slugify(name),
    type,
    'type-slug': slugify(type),
    'attributes': {
      name,
      textblock: ipsum({
        count: 3,
        units: 'paragraphs',
        format: 'html',
      }),
    },
  };

  rows[i] = item;
}

module.exports = {
  eachOfType: merged.eachOfType,
  rows,
};
