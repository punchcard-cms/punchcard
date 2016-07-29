'use strict';

/*
 * Dynamically returns robots.txt
 */
const all = `User-agent: *
Disallow:`;

const none = `User-agent: *
Disallow: /`;

const hide = process.env.ROBOTS === 'false';

const robots = application => {
  return new Promise(resolve => {
    const app = application;

    app.get('/robots.txt', (req, res) => {
      if (hide) {
        res.send(none);
      }
      else {
        res.send(all);
      }
    });

    resolve(app);
  });
};

module.exports = robots;
