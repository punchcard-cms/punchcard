'use strict';

/*
 * @fileoverview Content system routing
 *
 */

const config = require('config');
const content = require('punchcard-content-types');
const multipart = require('connect-multiparty');
const uuid = require('uuid');

const utils = require('../utils');
const db = require('../database');

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
        return next(new Error(`Content Type ${req.params.type} not found`));
      }

      res.render('content-types/landing', {
        content: {
          base: req.url,
          actions: config.content.actions,
          type,
        },
      });

      return true;
    });

    /*
     * Individual Content Type Add Page
     */
    app.get(`/${config.content.base}/:type/${config.content.actions.add}`, (req, res, next) => {
      const type = utils.singleItem('id', req.params.type.toLowerCase(), types);
      let errors = {};
      let values = {};

      try {
        errors = req.session.form.content.add.errors;
      }
      catch (e) {
        errors = {};
      }

      try {
        values = req.session.form.content.add.content;
      }
      catch (e) {
        values = {};
      }

      try {
        delete req.session.form.content.add; // eslint-disable-line no-param-reassign
      }
      catch (e) {
        req.session.form.content.add = {}; // eslint-disable-line no-param-reassign
      }

      values = utils.config(values);

      if (type === false) {
        return next(new Error(`Content Type ${req.params.type} not found`));
      }

      content.only(req.params.type, values, [type]).then(merged => {
        return content.form(merged, errors).then(form => {
          res.render('content-types/add', {
            form,
            action: req.url.replace(config.content.actions.add, config.content.actions.save),
          });
        });
      }).catch(e => {
        next(e);
      });

      return true;
    });

    /*
     *  Post to Content Type
     */
    app.post(`/${config.content.base}/:type/${config.content.actions.save}`, multipartMiddleware, (req, res, next) => {
      const type = utils.singleItem('id', req.params.type.toLowerCase(), types);

      if (type === false) {
        return next(new Error(`Content Type ${req.params.type} not found`));
      }

      // Validation
      const validated = content.form.validate(req.body, type);

      // utils.log(validated);

      if (validated === true) {
        // Sunrise/Sunset
        const sunrise = utils.time.iso(req.body['sunrise-date'], req.body['sunrise-time'], 'EDT');
        const sunset = utils.time.iso(req.body['sunset-date'], req.body['sunset-time'], 'EDT');

        db(`content-type--${req.params.type.toLowerCase()}`).insert({
          id: uuid.v4(),
          language: 'us-en',
          sunrise,
          sunset,
          approval: 0,
          publishable: false,
          value: req.body,
        }).then(() => {
          res.redirect(`/${config.content.base}/${req.params.type}`);
        }).catch(e => {
          next(e);
        });
      }
      else {
        const referrer = req.get('Referrer');
        req.session.form = { // eslint-disable-line no-param-reassign
          content: {
            add: {
              errors: validated,
              content: req.body,
            },
          },
        };
        res.redirect(referrer);
      }

      return true;
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
