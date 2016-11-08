'use strict';

const path = require('path');
const fs = require('fs');

const files = [
  path.join(process.cwd(), '', 'storage.js'),
  path.join(process.cwd(), '..', 'index.js'),
  path.join(process.cwd(), '..', 'Gulpfile.js'),
  path.join(process.cwd(), '../src/images', 'bee.svg'),
  path.join(process.cwd(), '../src/images', 'punchcard-image.svg'),
  path.join(process.cwd(), '../src/images', 'punchcard-404.svg'),
];

const fixtures = () => {
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


module.exports = fixtures;
