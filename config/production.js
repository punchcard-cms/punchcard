'use strict';
const path = require('path');

module.exports = {
  dbConfig: {
    host: 'prodhost',
    port: 1234,
    dbName: 'punchcardproddb',
  },
  contentTypes: {
    contentTypeDir: path.join(__dirname, '../content-types'),
    contentTypeExt: 'yml',
    viewsDir: path.join(__dirname, '../views/'),
    formTemplateFile: 'content-type-form.html',
  },
};
