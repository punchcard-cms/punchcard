'use strict';

const uuid = require('uuid');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');

const all = [
  path.join(process.cwd(), '', 'storage.js'),
  path.join(process.cwd(), '..', 'index.js'),
  path.join(process.cwd(), '..', 'Gulpfile.js'),
  path.join(process.cwd(), '../src/images', 'punchcard-image.svg'),
  path.join(process.cwd(), '../src/images', 'punchcard-404.svg'),
];

/*
 * Raw File Fixture
 *
 * @returns {array} - An array file objects as one receives from a multi-upload form
 */
const raw = () => {
  const files = _.cloneDeep(all);
  const items = [];
  let counter = files.length - 1;
  do {
    counter = Math.round(Math.random() * (files.length - 1));

    const type = path.extname(files[counter]) === '.js' ? 'document/javascript' : 'image/svg';

    items.push({
      fieldName: `file-upload--file-${counter}`,
      originalFilename: path.basename(files[counter]),
      path: files[counter],
      headers: {
        'content-disposition': `form-data; name="file-upload--file-${counter}"; filename="${path.basename(files[counter])}"`,
        'content-type': type,
      },
      size: fs.statSync(files[counter]).size,
      name: path.basename(files[counter]),
      type,
    });

    files.splice(counter, 1);
  } while (files.length > 0 && Math.random() > 0.5);


  return items;
};

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
      name: path.basename(files[counter]),
      path: `${uuid.v4()}${path.extname(files[counter])}`,
      type,
    });

    files.splice(counter, 1);
  } while (files.length > 0 && Math.random() > 0.5);


  return items;
};


module.exports = {
  raw,
  saved,
};
