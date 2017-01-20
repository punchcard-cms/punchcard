'use strict';

const _ = require('lodash');
const config = require('config');
const multer = require('multer');
const mkdirp = require('mkdirp');

const content = require('../content/middleware');
const users = require('../users/middleware');

module.exports = (app) => {
  return new Promise(res => {
    // temp file storage location
    const dest = config.storage.temp.dest || 'public/tmp/';

    // multer form handling setup
    const upload = multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          cb(null, `/${file.originalname}`);
        },
      }),
    });

    // creates temp storage location if it does not exist
    mkdirp.sync(dest);

    // add all content types and flows to request object
    app.use((req, response, next) => {
      const request = req;
      _.set(request, 'content.types', app.get('content-types'));
      _.set(request, 'content.workflows', app.get('workflows'));
      _.set(request, 'users.model', app.get('users-model'));

      next();
    });

    // content type landing
    app.use('/content/:type', content);

    // save a piece of content
    app.use('/content/:type/save', upload.any());

    // piece of content actions
    app.use('/content/:type/:id', content);
    app.use('/content/:type/:id/:revision', content);
    app.use('/content/:type/:id/:revision/edit', content);
    app.use('/content/:type/:id/:revision/approve', content);

    // individual user
    app.use('/users/:id', users);

    res(app);
  });
};
