/**
 *  @fileoverview Schema utilities
 *
 *  @author  Scott Nath
 *
 */
'use strict';

/*
  An object containing a piece of content's schema
  @typedef {Object} schemaObject
  @property {string} name - name of schema
  @property {string} type - type of data
 */

/*
  Get schema that are common to every content type

  @returns {array} an array of schemaObjects
 */
const getContentTypeCommonSchema = () => {
  return [
    {
      name: 'id',
      type: 'uuid',
    },
    {
      name: 'sunrise',
      type: 'date',
    },
    {
      name: 'sunset',
      type: 'date',
    },
    {
      name: 'created',
      type: 'date',
    },
    {
      name: 'parent',
      type: 'uuid',
    },
  ];
};

/*
  Get schema for a given content type. Combines commonSchema with the content-type's schema

  **NOTE**: creating dummy schema

  ## TODO
  * create function to get schema from content-types-object
  * add contentTypeName back in as parameter to get schema

  @param {string} contentTypeName  machine name of a content type

  @returns {array} an array of schemaObjects
 */
const getContentTypeSchema = () => {
  return new Promise(resolve => {
    const commonSchema = getContentTypeCommonSchema();

    // this will be replaced with a function to grab schema from content-types-object
    const tableSchema = [
      {
        name: 'title',
        type: 'string',
      },
      {
        name: 'email',
        type: 'string',
      },
      {
        name: 'url',
        type: 'string',
      },
    ];
    resolve(commonSchema.concat(tableSchema));
  });
};

module.exports = {
  getContentTypeCommonSchema,
  getContentTypeSchema,
};
