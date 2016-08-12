'use strict';
/*
 * @fileoverview Content system routing functions
 *
 */
const config = require('config');


const content = (req, res, types) => {
  console.log(req)
  console.log(req)

  res.render('content/home', {
    content: {
      home: config.content.home,
      base: config.content.base,
      types,
    },
  });
};


module.exports = {
  content,
};
