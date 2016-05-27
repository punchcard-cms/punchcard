'use strict';

const index = require('./routes/index');
const content = require('./routes/content');
const errors = require('./routes/errors');


module.exports = application => {
  return index(application).then(app => {
    return content(app);
  }).then(app => {
    return errors(app);
  });
};
