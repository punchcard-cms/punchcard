'use strict';

/**
 * @fileoverview Generic routing
 */
const express = require('express');
const router = new express.Router();

/*
Home Page Router
@function
@name /
*/
router.get('/', (req, res) => {
  res.render('index', { pageTitle: 'Punchcard Home' });
});

module.exports = router;
