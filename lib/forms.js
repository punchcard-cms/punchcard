/**
 *  @fileoverview Form functions
 *
 *  @author  Scott Nath
 *
 */
'use strict';
const uuid = require('uuid');
const db = require('./db');
const config = require('config');
const helpers = db.helpers;
const dataFunc = db.data;

/*
  Get data from a form

  ## TODO: data.id should always be new, but their should be some sort of connection to `parent` (revisions).

  @param {object} req express request
  @param {object} req.body key:value pairs from form inputs

  @returns {array} an array of table rows
 */
const getFormData = req => {
  const data = Object.assign({}, req.body);
  data.id = data.id || uuid.v4();
  data.created = helpers.timestamp();

  return data;
};

/*
  Form submission

  @param {object} req key : Value pairs from form inputs
  @param {function} res Express response
  @param {function} knex Configuration information
  @param {string} contentType content type path name

 */
const submitForm = (req, res, knex, table) => {
  const formData = getFormData(req);
  dataFunc.insertData(table, formData, res, knex)
    .then(response => {
      if (response === 'Insertion complete.') {
        res.redirect(`${config.contentTypes.contentTypesHome.path}/${table}`);
      }
    })
    .catch(err => {
      console.error(err);
    });
};

module.exports = {
  getFormData,
  submitForm,
};
