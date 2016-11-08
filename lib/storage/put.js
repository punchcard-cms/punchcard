'use strict';

const Vinyl = require('vinyl');
const vfs = require('vinyl-fs');
const sfa = require('stream-from-array');
const map = require('map-stream');
const uuid = require('uuid');
const config = require('config');
const fs = require('fs');
const path = require('path');

let adapter = '';
const builtInProps = ['uuid', '_uuid', 'field', '_field', 'type', '_type', 'rel', '_rel'];

try {
  // Need to have the require here so it can be dynamic
  adapter = require(`vinyl-${config.storage.type}`); // eslint-disable-line global-require
}
catch (e) {
  adapter = vfs;
}

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
    return this._type;
  }

  set rel(path) {
    if (path) {
      this._rel = path;
    }
  }

  static isCustomProp(name) {
    return super.isCustomProp(name) && builtInProps.indexOf(name) === -1;
  }
}

const mapFiles = files => {
  return files.map(file => {
    return new Promise((res, rej) => {
      fs.readFile(file.path, (err, data) => {
        if (err) {
          rej(err);
        }

        const f = new PunchcardFile({
          cwd: '/',
          base: '/',
          path: `/${file.originalFilename}`,
          contents: data,
        });

        f.field = file.fieldName;
        f.type = file.type;
        f.path = `/${f.uuid}${path.extname(file)}`;

        res(f);
      });
    });
  });
};

const punchcardStream = items => {
  return new Promise((res, rej) => {
    const files = {};

    sfa.obj(items)
      .pipe(adapter.dest(config.storage.dest, config.storage.settings))
      .pipe(map((file, cb) => {
        files[file.field] = file;
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

// { fieldName: 'file-upload--file--1',
//   originalFilename: 'snugugmeme.jpg',
//   path: '/var/folders/4r/ppqgt5h53p7dj_2l8qvffgfw0000gp/T/MrHfbHOYvJFBQHsjf9LTXrkX.jpg',
//   headers:
//    { 'content-disposition': 'form-data; name="file-upload--file--1"; filename="snugugmeme.jpg"',
//      'content-type': 'image/jpeg' },
//   size: 80323,
//   name: 'snugugmeme.jpg',
//   type: 'image/jpeg' }

// const plugin = file => {
//   return new Promise(res => {
//     res(`file.path`);
//   });
// }

const put = files => {
  const streams = files.map(mapFiles);

  return Promise.all(streams).then(items => {
    return punchcardStream(items);
  });
};

module.exports = put;
