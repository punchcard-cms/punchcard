'use strict';

/**
 * @fileoverview Access Control Lists
 */
const config = require('config');
const NodeAcl = require('acl');

const userRoles = config.roles.config;

// memoryBackend starts with a lowercase from node-acl
const acl = new NodeAcl(new NodeAcl.memoryBackend()); // eslint-disable-line new-cap

/*
 * Get user roles from configuration
 *
 * @param {array} cfg user configuration
 *
 * @returns {array} user configuration
 */
const roles = (cfg) => {
  let rolesConfig;
  let aclRoles = [];
  if (cfg) {
    if (!Array.isArray(cfg)) {
      throw new Error(config.roles.messages.config.type);
    }
    rolesConfig = cfg;
  }
  else {
    rolesConfig = userRoles;
  }

  if (rolesConfig && Array.isArray(rolesConfig)) {
    aclRoles = rolesConfig.map((role) => {
      return {
        roles: role.id,
        allows: role.allows,
      };
    });
  }

  return aclRoles;
};

/*
 * gets the ID from currently logged in user
 *
 * @param {object} req Express HTTP request
 */
const getUserId = (req) => {
  return req.user && req.user.id.toString() || false;
};

/*
 * Middleware to re-register a user
 * Needed because roles are not persistent after a server crash.
 *
 * @param {object} req Express HTTP request
 * @param {object} res Express HTTP response
 * @param {object} next Express callback
 *
 */
const reregsiter = (req, res, next) => {
  if (req.user) {
    acl.addUserRoles(getUserId(req), req.user.role, (err) => {
      if (err) throw new Error(err);
    });
  }
  next();
};

// Define roles, resources and permissions
acl.allow(roles());

module.exports = acl;
module.exports.roles = roles;
module.exports.getUserId = getUserId;
module.exports.reregsiter = reregsiter;
