'use strict';

/**
 * @fileoverview Applications routing functions
 *
 */

/**
 * All Webhooks Landing page
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {object} next - Express callback
 *
 */
const all = () => {};

/**
 * Add a new Webhook
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {object} next - Express callback
 *
 *
 * TODO: Content-Types errors need to be vastly expanded to properly use promise catch for error
 * https://github.com/punchcard-cms/content-types/issues/112
 */
const add = () => {};

/**
 * View/edit an individual Webhook
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {object} next - Express callback
 *
 */
const one = () => {};

/**
 * Create a new client secret
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {object} next - Express callback
 *
 */
const secret = () => {};

/**
 * View/edit an individual Webhook
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 *
 */
const save = () => {};

module.exports = {
  all,
  add,
  one,
  secret,
  save,
};
