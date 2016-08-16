'use strict';

const schedule = require('node-schedule');
const moment = require('moment-timezone');

const utils = require('../utils');

const date = moment('2016-08-15 15:01:00-05');


console.log(date.format());
console.log(date.fromNow());

try {
  schedule.scheduleJob(date.format(), () => {
    console.log('It did stuff!');
  });
}
catch(e) {
  console.error(e);
}



const bootstrap = () => {

};


const golive = (uuid, type) => {

};


module.exports = golive;
module.exports.bootstrap = bootstrap;
