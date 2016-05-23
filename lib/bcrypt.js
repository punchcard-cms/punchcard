'use strict';

/**
 * @fileoverview Password functions
 */
const bcrypt = require('bcrypt-nodejs');

/*
 * Generates a password from a string
 *
 * @param {string} password a password to be encrypted
 *
 * @returns {string} an encrypted password
 */
const generatePasswordHash = (password, salt) => {
  let salted;

  if (typeof password !== 'string') {
    throw new Error('generatePasswordHash requires `password` to be a string');
  }

  if (!salt) {
    salted = bcrypt.genSaltSync(10);
  }
  else {
    salted = salt;
  }

  return bcrypt.hashSync(password, salted, null);
};

module.exports = bcrypt;
module.exports.generatePasswordHash = generatePasswordHash;
