'use strict';

/**
 * @fileoverview Login check middleware
 */
const config = require('config');

// const authenticated = (role) => {
//   const url = config.authentication.paths.login;

//   return (req, res, next) => {
//     // check if authenticated
//     if (!req.isAuthenticated || !req.isAuthenticated()) {
//       return res.redirect(url);
//     }

//     // check for role
//     if (req.user.role !== role) { // TODO: needs to be changed to check level is WITHIN range
//       res.sendStatus(403);
//     }

//     return next();
//   };
// };

/*
 * Check authenticated status. Redirect to login page
 *
 * @param {object} req Express HTTP request
 * @param {object} res Express HTTP response
 * @param {object} next Express callback
 *
 */
const authenticated = (req, res, next) => {
  console.log('fuck this shitFIRST');
  console.log(req.headers);
  // check if authenticated and not on login page
  if ((!req.isAuthenticated || !req.isAuthenticated()) && req.url !== '/') {
    console.log('fuck this shit 2nd');
    if(res.headersSent) {
      console.log('FUCK YOU');
    }
//    res.status(403).location('/login').end();
    res.render('login', {
      pageTitle: 'Login',
    });
  }

    if(res.headersSent) {
      console.log('FUCK YOU22222');
    }
  next();
};

module.exports = authenticated;
