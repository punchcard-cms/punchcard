/**
 *  @fileoverview CRUD database functions
 *
 *  @author  Scott Nath
 *
 */
'use strict';

/*
  Get all rows in a table
  @param {string} table  the name of the table in the database
  @param {function} knex Configuration information

  @returns {array} an array of table rows
 */
const getTable = (table, knex) => {
  return knex.select('*').from(table);
};

/*
  Get one row from the table

  @param {string} table  the name of the table in the database
  @param {string} table  the id of the entry in the database
  @param {function} knex Configuration information

  @returns {array} an array of table rows
 */
const getRow = (table, id, knex) => {
  return knex.select('*').from(table).where({ id });
};

/*
  Inserts data into table and sends successful response

  @param {string} tableName Name of table in database
  @param {string} data Item being added into a table row
  @param {function} res Express response
  @param {function} knex Configuration information

  @returns {res} res Express response to be render on success
 */
const insertData = (table, data, res, knex) => {
  return knex(table).insert(data)
    .then(() => {
      return 'Insertion complete.';
    });
};

module.exports = {
  getTable,
  getRow,
  insertData,
};
