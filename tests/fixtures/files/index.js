'use strict';

const uuid = require('uuid');
const _ = require('lodash');
const path = require('path');

const all = [
  path.join(process.cwd(), '', 'storage.js'),
  path.join(process.cwd(), '..', 'index.js'),
  path.join(process.cwd(), '..', 'Gulpfile.js'),
  path.join(process.cwd(), '../src/images', 'punchcard-image.svg'),
  path.join(process.cwd(), '../src/images', 'punchcard-404.svg'),
];

/*
 * Saved File Fixtures
 *
 * @returns {array} - Array of objects describing files as it's stored in the database. Object contains the original file's file name (name), the relative path to the file plugin (path), and the file's MIME type (type)
 */
const saved = () => {
  const files = _.cloneDeep(all);
  const items = [];
  let counter = files.length - 1;
  do {
    counter = Math.round(Math.random() * (files.length - 1));

    const type = path.extname(files[counter]) === '.js' ? 'document/javascript' : 'image/svg';

    items.push({
      original: path.basename(files[counter]),
      relative: `${uuid.v4()}${path.extname(files[counter])}`,
      type,
    });

    files.splice(counter, 1);
  } while (files.length > 0 && Math.random() > 0.5);


  return items;
};


module.exports = {
  saved,
};
