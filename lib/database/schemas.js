'use strict';

/**
 * Individual Content Type Schema
 */
const content = [
  {
    name: 'revision',
    type: 'increments',
    index: true,
  },
  {
    name: 'id',
    type: 'string',
  },
  {
    name: 'created',
    type: 'timestamp',
  },
  {
    name: 'language',
    type: 'string',
  },
  {
    name: 'sunrise',
    type: 'dateTime',
  },
  {
    name: 'sunset',
    type: 'dateTime',
  },
  {
    name: 'approval',
    type: 'integer',
  },
  {
    name: 'publishable',
    type: 'boolean',
  },
  {
    name: 'value',
    type: 'jsonb',
  },
];

/**
 * All Content Types Schema
 */
const allTypes = [
  {
    name: 'version',
    type: 'increments',
    index: true,
  },
  {
    name: 'created',
    type: 'timestamp',
  },
  {
    name: 'value',
    type: 'jsonb',
  },
];

/*
 * Users schema
 */
const users = [
  {
    name: 'id',
    type: 'increments',
    index: true,
  },
  {
    name: 'email',
    type: 'string',
  },
  {
    name: 'password',
    type: 'string',
  },
  {
    name: 'role',
    type: 'string',
  },
  {
    name: 'access',
    type: 'jsonb',
  },
  {
    name: 'created',
    type: 'timestamp',
  },
  {
    name: 'updated',
    type: 'timestamp',
  },
];

module.exports = [
  {
    name: 'content',
    fields: content,
  },
  {
    name: 'all-types',
    fields: allTypes,
  },
  {
    name: 'users',
    fields: users,
  },
];
