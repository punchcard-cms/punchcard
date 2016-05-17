'use strict';

const path = require('path');

module.exports = () => {
  return {
    sassDir: path.join(__dirname, '..', 'src', 'sass'),
  };
};
