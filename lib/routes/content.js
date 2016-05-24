'use strict';

/*
 * @fileoverview Content system routing
 *
 */

const config = require('config');
const content = require('punchcard-content-types');
const utils = require('../utils');
const multipart = require('connect-multiparty');

const multipartMiddleware = multipart();

/*
 * Content Route Resolution
 *
 * @param {object} application - Express Application
 * @returns {object} - Configured Express Application
 */
const contentRoutes = application => {
  return new Promise(resolve => {
    const app = application;
    const types = app.get('content-types');

    /*
     * Content Home Page
     */
    app.get(`/${config.content.base}`, (req, res) => {
      res.render('content-types/home', {
        content: {
          home: config.content.home,
          base: config.content.base,
          types,
        },
      });
    });

    /*
     * Individual Content Type Landing Page
     */
    app.get(`/${config.content.base}/:type`, (req, res, next) => {
      const type = utils.singleItem('id', req.params.type.toLowerCase(), types);

      if (type === false) {
        next(new Error(`Content Type ${req.params.type} not found`));
      }
      else {
        res.render('content-types/landing', {
          content: {
            base: req.url,
            actions: config.content.actions,
            type,
          },
        });
      }
    });

    /*
     * Individual Content Type Add Page
     */
    app.get(`/${config.content.base}/:type/${config.content.actions.add}`, (req, res, next) => {
      const type = utils.singleItem('id', req.params.type.toLowerCase(), types);

      console.log(req.url);

      if (type === false) {
        next(new Error(`Content Type ${req.params.type} not found`));
      }
      else {
        content.form(type).then(form => {
          res.render('content-types/add', {
            form,
            action: req.url.replace(config.content.actions.add, config.content.actions.save),
          });
        }).catch(e => {
          next(e);
        });
      }
    });

    /*
     *  Post to Content Type
     */
    app.post(`/${config.content.base}/:type/${config.content.actions.save}`, multipartMiddleware, (req, res, next) => {
      const type = utils.singleItem('id', req.params.type.toLowerCase(), types);

      const referrer = req.get('Referrer');

      console.log(req.get('Referrer'));
      console.log(req.body);

      if (type === false) {
        next(new Error(`Content Type ${req.params.type} not found`));
      }
      else {

        res.redirect(referrer);
      }
    });

    resolve(app);
  });
};

module.exports = contentRoutes;


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
