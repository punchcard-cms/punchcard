'use strict';

/**
 * @fileoverview Content system routing
 */
const express = require('express');
const router = new express.Router();

// const find = require('lodash/find');
// const config = require('config');
// const multipart = require('connect-multiparty');
// const multipartMiddleware = multipart();
// const knex = require('knex')(config.knex);

// const db = require('../db');
// const dataFunc = db.data;

/*
Content Types landing
@function
@name /content/
*/
// router.get('/', (req, res) => {
//   res.render('content-types/types-landing', {
//     pageTitle: req.app.locals.contentTypesConfig.contentTypesHome.title,
//   });
// });

// /*
// Individual Content Type landing
// @function
// @name /content/foo-content-type
// */
// router.get('/:contentType', (req, res) => {
//   const thisContentTypeInfo = find(req.app.locals.contentTypesNames, { machine: req.params.contentType });
//   let content;

//   // dataFunc.getTable(req.params.contentType, knex)
//   // .then(rows => {
//   //   content = rows;
//   // })
//   // .catch(error => {
//   //   console.error(error);
//   // })
//   // .finally(() => {
//   res.render('content-types/landing', {
//     pageTitle: thisContentTypeInfo.name,
//     contentTypeInfo: thisContentTypeInfo,
//     contentTypeContent: content,
//   });

//   //   return;
//   // });
// });


// /*
// Individual Content Type add-new page
// @function
// @name /content/foo-content-type/add
// */
// router.get('/:contentType/add', (req, res) => {
//   const thisContentTypeInfo = find(req.app.locals.contentTypesNames, { machine: req.params.contentType });

//   // TEMP removed until we have sam's magic form
//   // contentTypes.getForm(req.params.contentType)
//   // .then(value => {
//   //   res.render('content-types/content-type-add', {
//   //     pageTitle: `${thisContentTypeInfo.name} :: Add`,
//   //     contentTypeInfo: thisContentTypeInfo,
//   //     form: value,
//   //   });
//   //   return;
//   // })
//   // .catch(reason => {
//   //   console.error(reason);
//   //   throw reason;
//   // });
//   res.render('content-types/add', {
//     pageTitle: `${thisContentTypeInfo.name} :: Add`,
//     contentTypeInfo: thisContentTypeInfo,
//     action: '',
//     samsMagicFormIsMagic: 'form goes here',
//   });
// });

// // POST method route
// // router.post('/:contentType/add', multipartMiddleware, (req, res) => {
// //   forms.submitForm(req, res, knex, req.params.contentType);
// // });


// /*
// Individual Content Type edit entry page
// TODO: inject content into form
// @function
// @name /content/foo-content-type/edit/{{id}}
// */
// router.get('/:contentType/edit/:id', (req, res) => {
//   const thisContentTypeInfo = find(req.app.locals.contentTypesNames, { machine: req.params.contentType });
//   let content;

//   // dataFunc.getRow(req.params.contentType, req.params.id, knex)
//   // .then(row => {
//   //   content = row;
//   // })
//   // .catch(error => {
//   //   console.error(error);
//   // })
//   // .finally(() => {
//     // this render should populate the form
//   res.render('content-types/add', {
//     pageTitle: thisContentTypeInfo.name,
//     contentTypeInfo: thisContentTypeInfo,
//     contentTypeContent: content,
//   });

//   //   return;
//   // });
// });

// POST method route
// router.post('/:contentType/edit/:id', multipartMiddleware, (req, res) => {
//   forms.submitForm(req, res, knex, req.params.contentType);
// });

module.exports = router;
