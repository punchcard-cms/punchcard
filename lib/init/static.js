'use strict';

const express = require('express');
const path = require('path');

module.exports = (app) => {
  return new Promise(res => {
    app.use(express.static(path.join(process.cwd(), 'public')));

    res(app);
  });
};
