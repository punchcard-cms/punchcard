'use strict';

const Vinyl = require('vinyl');
const vfs = require('vinyl-fs');
const sfa = require('stream-from-array');
const map = require('map-stream');
const uuid = require('uuid');
const config = require('config');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

let adapter = '';
const builtInProps = ['uuid', '_uuid', 'field', '_field', 'type', '_type', 'rel', '_rel'];

try {
  // Need to have the require here so it can be dynamic
  adapter = require(`vinyl-${config.storage.type}`); // eslint-disable-line global-require
}
catch (e) {
  console.error(`Could not find Vinyl Adapter 'vinyl-${config.storage.type}'. Falling back to 'vinyl-fs'.`); // eslint-disable-line no-console
  adapter = vfs;
}

/*
 * Punchcard File
 *
 * Custom Vinyl Type
 *
 * Adds UUID (uuid), field the file came from (field), file MIME type (type), and relative path from pluggable storage root (rel) to standard Vinyl object.
 *
 * READ - uuid
 * READ/WRITE - field, type, rel
 */
class PunchcardFile extends Vinyl {
  constructor(options) {
    super(options);

    this._uuid = uuid.v4();
    this._field = '';
    this._type = '';
    this._rel = '';
  }

  get uuid() {
    return this._uuid;
  }

  get field() {
    return this._field;
  }

  set field(field) {
    if (field) {
      this._field = field;
    }
  }

  get type() {
    return this._type;
  }

  set type(type) {
    if (type) {
      this._type = type;
    }
  }

  get rel() {
    return this._rel;
  }

  set rel(pth) {
    if (pth) {
      this._rel = pth;
    }
  }

  static isCustomProp(name) {
    return super.isCustomProp(name) && builtInProps.indexOf(name) === -1;
  }
}

/*
 * File DJ
 *
 * Turns a file in to a PunchcardFile object
 *
 * @param {object} file - A File object as received from a multi-part form
 *
 * @returns {object} - A Promise that resolves to a new PunchcardFile, with UUID, Type, Path, and Rel available
 */
const fileDJ = file => {
  return new Promise((res, rej) => {
    fs.readFile(file.path, (err, data) => {
      if (err) {
        rej(err);
      }
      console.log('fileDJ');
      console.log(JSON.stringify(file, null, 2));
      const f = new PunchcardFile({
        cwd: '/',
        base: '/',
        path: `/${file.originalname}`,
        contents: data,
      });

      f.field = file.fieldname;
      f.type = file.mimetype;
      f.path = `/${f.uuid}${path.extname(file.originalname)}`;
      f.rel = `/${f.uuid}${path.extname(file.originalname)}`;
      f.original = file.originalname;

      res(f);
    });
  });
};

/**
 * Get the storable value for a file
 *
 * @param  {object} file - Vinyl-compatible PunchcardFile object
 *
 * @returns {object} - contains data to be stored about this file
 */
const value = file => {
  const storable = {};

  storable.type = _.get(file, 'type', '');
  storable.original = _.get(file, 'original', '');
  storable.relative = _.get(file, 'rel', '');

  return storable;
};

/*
 * Punchcard Stream
 *
 * Takes an array of Vinyl-compatible PunchcardFile objects, streams them through the chosen adapter, collects the results, and wraps the whole thing in a promise.
 *
 * @param {array} items - Array of PunchcardFile objects
 *
 * @returns {object} - Keys are file fields, values are the result of the stream transformation
 */
const punchcardStream = items => {
  return new Promise((res, rej) => {
    const files = {};

    sfa.obj(items)
      .pipe(adapter.dest(config.storage.dest, config.storage.settings))
      .pipe(map((file, cb) => {
        files[file.field] = value(file);
        cb(null, file);
      }))
      .on('error', e => {
        rej(e);
      })
      .on('end', () => {
        res(files);
      });
  });
};

/*
 * File Put
 *
 * @param {array} files - An array of file objects as received from a multi-part form
 *
 * @returns {object} - Results from Punchcard Stream
 */
const put = files => {
  const streams = files.map(fileDJ);

  return Promise.all(streams).then(items => {
    return punchcardStream(items);
  });
};

module.exports = put;
