import test from 'ava';
import request from 'supertest';
import bcrypt from 'bcrypt-nodejs';
import Promise from 'bluebird';
import uuid from 'uuid';
import includes from 'lodash/includes';

import punchcard from '../';
import database from '../lib/database';

let agent;
let cookie;
const serviceUuid = uuid.v4();

let accounts = [
  {
    email: 'admin@test.com',
    password: 'pa55word',
    role: 'admin',
  },
  {
    email: 'creator@test.com',
    password: 'pa55word',
    role: 'creator',
  },
];

const getUser = (usr) => {
  return database.select('*').from('users').where({
    email: usr.email,
  });
};

const userCheck = (usr) => {
  return getUser(usr).then(user => {
    if (user.length < 1) {
      return database('users').insert({
        email: usr.email,
        password: bcrypt.hashSync(usr.password),
        role: usr.role,
      });
    }

    return [];
  });
};

const service = [
  {
    id: serviceUuid,
    language: 'test-dummy-entry',
    publishable: false,
    approval: 2,
    value: {},
    audit: { entries: [] },
  },
];

const getService = (svc) => {
  return database.select('*').from('content-type--services').where({
    id: svc.id,
  });
};

const addService = (svc) => {
  return database('content-type--services').insert(svc).returning('revision');
};

const serviceCheck = (svc) => {
  return getService(svc).then(srvc => {
    if (srvc.length < 1) {
      return addService(svc);
    }

    return [];
  });
};

const deleteService = () => {
  return database('content-type--services').where('language', '=', 'test-dummy-entry').del();
};

// cue up our application for all tests
test.cb.before((t) => {
  punchcard().then(app => {
    agent = request.agent(app);

    return Promise.map(service, serviceCheck);
  }).then(() => {
    return Promise.map(accounts, userCheck);
  }).then(() => {
    return Promise.map(accounts, getUser);
  }).then((users) => {
    accounts = accounts.map(account => {
      const act = account;
      const usr = users.filter(user => {
        if (user[0].email === account.email) {
          return true;
        }

        return false;
      })[0][0];

      act.id = usr.id;

      return act;
    });

    agent.post('/login')
      .send({
        email: accounts[0].email,
        password: accounts[0].password,
        provider: 'local',
      })
      .expect('set-cookie', /connect.sid/)
      .expect(302)
      .expect('location', '/')
      .end((err, res) => { // eslint-disable-line
        if (err) throw err;

        cookie = res.headers['set-cookie'];
        t.end();
      });
  });
});

test.cb.after((t) => {
  punchcard().then(() => {
    return deleteService();
  }).then(() => {
    t.end();
  });
});

test.cb('CMS Landing Page', t => {
  agent
    .get('/')
    .set('cookie', cookie)
    .expect(200)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');
      t.end();
    });
});

//////////////////////////////
// Content Pages
//////////////////////////////
test.cb('Content Landing Page', t => {
  agent
    .get('/content')
    .set('cookie', cookie)
    .expect(200)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

      t.end();
    });
});


//////////////////////////////
// Content Pages - type landing page
//////////////////////////////
test.cb('Content Type Landing Page', t => {
  agent
    .get('/content/services')
    .set('cookie', cookie)
    .expect(200)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

      t.end();
    });
});

test.cb('Invalid Content Type - Landing', t => {
  agent
    .get('/content/foo')
    .set('cookie', cookie)
    .expect(404)
    .end(err => {
      t.is(err, null, 'Should not have an error');
      t.end();
    });
});


//////////////////////////////
// Content Pages - type add-content page
//////////////////////////////
test.cb('Content Type Add Page', t => {
  agent
    .get('/content/services/add')
    .set('cookie', cookie)
    .expect(200)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

      t.end();
    });
});

test.cb('Invalid Content Type - Add', t => {
  agent
    .get('/content/foo/add')
    .set('cookie', cookie)
    .expect(404)
    .end(err => {
      t.is(err, null, 'Should not have an error');
      t.end();
    });
});

//////////////////////////////
// Content Pages - individual piece of content page
//////////////////////////////
test.cb('Content Type Individual Landing ', t => {
  agent
    .get(`/content/services/${serviceUuid}`)
    .set('cookie', cookie)
    .expect(200)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');
      t.end();
    });
});

test.cb('Content Type Individual Landing - non UUID', t => {
  agent
    .get('/content/services/foo')
    .set('cookie', cookie)
    .expect(404)
    .end((err, res) => {
      t.is(err, null, 'Should have an error');
      t.true(includes(res.text, 'Content ID must be in UUID format', 'Content url requires an ID'));
      t.end();
    });
});

test.cb('Content Type Individual Landing - bad UUID', t => {
  const badUuid = uuid.v4();
  agent
    .get(`/content/services/${badUuid}`)
    .set('cookie', cookie)
    .expect(404)
    .end((err, res) => {
      t.is(err, null, 'Should have an error');
      t.true(includes(res.text, `Content with ID &#39;${badUuid}&#39; in Content Type &#39;services&#39; not found`, 'Content url requires an ID'));
      t.end();
    });
});

//////////////////////////////
// Content Pages - individual revision page
//////////////////////////////

test.cb('Invalid Content Type - individual revision', t => {
  addService(service).then(revision => {
    agent
      .get(`/content/foo/${serviceUuid}/${revision}`)
      .set('cookie', cookie)
      .expect(404)
      .end(err => {
        t.is(err, null, 'Should not have an error');
        t.end();
      });
  });
});

test.cb('Non UUID - individual revision', t => {
  agent
    .get('/content/services/foo/123')
    .set('cookie', cookie)
    .expect(404)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.true(includes(res.text, 'Content ID must be in UUID format', 'Content url requires an ID'));
      t.end();
    });
});

test.cb('Content Type Revision View - non number', t => {
  agent
    .get(`/content/services/${serviceUuid}/foo`)
    .set('cookie', cookie)
    .expect(404)
    .end((err, res) => {
      t.is(err, null, 'Should have an error');
      t.true(includes(res.text, 'Revision must be a number', 'Revision must be a number'));
      t.end();
    });
});

test.cb('Content Type Revision View', t => {
  addService(service).then(revision => {
    agent
      .get(`/content/services/${serviceUuid}/${revision}`)
      .set('cookie', cookie)
      .expect(200)
      .end((err, res) => {
        t.is(err, null, 'Should not have an error');
        t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

        t.end();
      });
  });
});

//////////////////////////////
// Content Pages - content edit page
//////////////////////////////

test.cb('Invalid Content Type - Content Type Edit Page', t => {
  addService().then(revision => {
    agent
      .get(`/content/foo/${serviceUuid}/${revision}/edit`)
      .set('cookie', cookie)
      .expect(404)
      .end(err => {
        t.is(err, null, 'Should not have an error');
        t.end();
      });
  });
});

test.cb('Non UUID - Content Type Edit Page', t => {
  agent
    .get('/content/services/foo/123/edit')
    .set('cookie', cookie)
    .expect(404)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.true(includes(res.text, 'Content ID must be in UUID format', 'Content url requires an ID'));
      t.end();
    });
});

test.cb('Bad revision number - Content Type Edit Page', t => {
  agent
    .get(`/content/services/${serviceUuid}/0/edit`)
    .set('cookie', cookie)
    .expect(404)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.true(includes(res.text, `Revision &#39;0&#39; for ID &#39;${serviceUuid}&#39; in Content Type &#39;services&#39; not found`, 'Bad revision or id'));
      t.end();
    });
});

test.cb('Non number for revision - Content Type Edit Page', t => {
  agent
    .get(`/content/services/${serviceUuid}/foo/edit`)
    .set('cookie', cookie)
    .expect(404)
    .end((err, res) => {
      t.is(err, null, 'Should have an error');
      t.true(includes(res.text, 'Revision must be a number', 'Revision must be a number'));
      t.end();
    });
});

test.cb('Content Type Post data - testing session', t => {
  const svc = (JSON.parse(JSON.stringify(service)));
  svc[0].value = {
    'service-name--text': 'thing',
    'sunset-date': 'another thing',
  };
  addService(svc).then(revision => {
    agent
      .get(`/content/services/${serviceUuid}/${revision}/edit`)
      .set('cookie', cookie)
      .expect(200)
      .end((err, res) => {
        t.is(err, null, 'Should not have an error');
        t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

        t.end();
      });
  });
});

test.cb('Content Type Edit Page', t => {
  getService({ id: serviceUuid }).then(srvc => {
    agent
      .get(`/content/services/${serviceUuid}/${srvc[0].revision}/edit`)
      .set('cookie', cookie)
      .expect(200)
      .end((err, res) => {
        t.is(err, null, 'Should not have an error');
        t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

        t.end();
      });
  });
});

//////////////////////////////
// Content Pages - content Post data
//////////////////////////////

test.cb('Invalid Content Type - Post data', t => {
  agent
    .post('/content/foo/save')
    .field('id', serviceUuid)
    .set('cookie', cookie)
    .expect(404)
    .end(err => {
      t.is(err, null, 'Should have an error');
      t.end();
    });
});

test.cb('Database error - Content Type Post data', t => {
  agent
    .post('/content/services/save')
    .field('language', 'Character Character Character Character Character Character Character Character Character Character Character Character Character Character Character Character Character Character Character Character Character Character Character Character Character Character Character Character')
    .set('cookie', cookie)
    .expect(500)
    .end((err, res) => {
      t.is(err, null, 'Should have an error');
      t.true(includes(res.text, 'error: insert into &quot;content-type--services&quot;', 'should have an error message'));

      t.end();
    });
});

test.cb('Content Type Post data', t => {
  agent
    .post('/content/services/save')
    .field('language', 'test-dummy-entry')
    .field('approval', 1)
    .field('service-name--text', 'Picachu')
    .set('cookie', cookie)
    .expect(302)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.is(res.text, 'Found. Redirecting to /content/services', 'should have a redirect message');

      t.end();
    });
});

test.cb('Content Type Post data - testing session', t => {
  addService(service).then(revision => {
    agent
      .get(`/content/services/${serviceUuid}/${revision}/edit`)
      .set('cookie', cookie)
      .expect(200)
      .end((err) => {
        t.is(err, null, 'Should not have an error');
        agent
          .post('/content/services/save')
          .field('language', 'test-dummy-entry')
          .field('service-email--email', 'not an email')
          .set('cookie', cookie)
          .expect(302)
          .end((error, res) => {
            t.is(error, null, 'Should not have an error');
            t.true(includes(res.text, 'Found. Redirecting to', 'should have a redirect message'));

            t.end();
          });
      });
  });
});

//////////////////////////////
// Content Approval - approve page
//////////////////////////////

test.cb('Invalid Content Type - Content Approval Page', t => {
  addService().then(revision => {
    agent
      .get(`/content/foo/${serviceUuid}/${revision}/approve`)
      .set('cookie', cookie)
      .expect(404)
      .end(err => {
        t.is(err, null, 'Should not have an error');
        t.end();
      });
  });
});

test.cb('Non UUID - Content Approval Page', t => {
  agent
    .get('/content/services/foo/123/approve')
    .set('cookie', cookie)
    .expect(404)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.true(includes(res.text, 'Content ID must be in UUID format', 'Content url requires an ID'));
      t.end();
    });
});

test.cb('Bad revision number - Content Approval Page', t => {
  agent
    .get(`/content/services/${serviceUuid}/0/approve`)
    .set('cookie', cookie)
    .expect(404)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.true(includes(res.text, `Revision &#39;0&#39; for ID &#39;${serviceUuid}&#39; in Content Type &#39;services&#39; not found`, 'Bad revision or id'));
      t.end();
    });
});

test.cb('Non number for revision - Content Approval Page', t => {
  agent
    .get(`/content/services/${serviceUuid}/foo/approve`)
    .set('cookie', cookie)
    .expect(404)
    .end((err, res) => {
      t.is(err, null, 'Should have an error');
      t.true(includes(res.text, 'Revision must be a number', 'Revision must be a number'));
      t.end();
    });
});

test.cb('Content Approval Page', t => {
  getService({ id: serviceUuid }).then(srvc => {
    agent
      .get(`/content/services/${serviceUuid}/${srvc[0].revision}/approve`)
      .set('cookie', cookie)
      .expect(200)
      .end((err, res) => {
        t.is(err, null, 'Should not have an error');
        t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

        t.end();
      });
  });
});

//////////////////////////////
// Content Approval - approve Post data
//////////////////////////////

test.cb('Invalid Content Approval - Post data', t => {
  agent
    .post('/content/foo/approve')
    .field('id', serviceUuid)
    .set('cookie', cookie)
    .expect(404)
    .end(err => {
      t.is(err, null, 'Should have an error');
      t.end();
    });
});

test.skip('Database error - Content Approval Post data', t => {
  agent
    .post('/content/services/approve')
    .field('language', 'test-dummy-entry')
    .field('approval', 'test')
    .set('cookie', cookie)
    .expect(500)
    .end((err, res) => {
      t.is(err, null, 'Should have an error');
      t.true(includes(res.text, 'error: insert into &quot;content-type--services&quot;', 'should have an error message'));

      t.end();
    });
});

test.skip('Content Type Approval data', t => {
  agent
    .post('/content/services/save')
    .field('language', 'test-dummy-entry')
    .field('approval', 1)
    .field('service-name--text', 'Picachu')
    .set('cookie', cookie)
    .expect(302)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.is(res.text, 'Found. Redirecting to /content/services', 'should have a redirect message');

      t.end();
    });
});

test.cb('Content Type Approval data - missing data: comment', t => {
  addService(service).then(revision => {
    agent
      .post('/content/services/approve')
      .send({
        'language': 'test-dummy-entry',
        'comment--textarea': '',
        'action--select': 'approve',
      })
      .set('cookie', cookie)
      .set('Referrer', `/content/services/${serviceUuid}/${revision}/approve`)
      .expect(302)
      .end((error, res) => {
        t.is(error, null, 'Should not have an error');
        t.true(includes(res.text, `Found. Redirecting to /content/services/${serviceUuid}/${revision}/approve`, 'should have a redirect message'));

        t.end();
      });
  });
});

test.cb('Content Type Approval data - missing data: action', t => {
  addService(service).then(revision => {
    agent
      .post('/content/services/approve')
      .send({
        'language': 'test-dummy-entry',
        'comment--textarea': 'I like it, kinda',
        'action--select': '',
      })
      .set('cookie', cookie)
      .set('Referrer', `/content/services/${serviceUuid}/${revision}/approve`)
      .expect(302)
      .end((error, res) => {
        t.is(error, null, 'Should not have an error');
        t.true(includes(res.text, `Found. Redirecting to /content/services/${serviceUuid}/${revision}/approve`, 'should have a redirect message'));

        t.end();
      });
  });
});

test.skip('Content Approval Post data', t => {
  addService(service).then(revision => {
    agent
      .get(`/content/services/${serviceUuid}/${revision}/approve`)
      .set('cookie', cookie)
      .expect(200)
      .end((err1, res1) => {
        t.is(err1, null, 'Should not have an error');
        t.true(includes(res1.text, 'action="/content/services/approve"'), 'should have correct form action url');
        t.true(includes(res1.text, 'Send to Editor</button>'), 'Should have the first button in approval step');

        agent
          .post('/content/services/approve')
          .send({
            'comment--textarea': 'I like it, you are a winner.',
            'action--select': 'approve',
          })
          .set('cookie', cookie)
          .expect(302)
          .end((err2, res2) => {
            t.is(err2, null, 'Should not have an error');
            t.true(includes(res2.text, 'Found. Redirecting to /content/services', 'should have a redirect message'));

            agent
              .get(`/content/services/${serviceUuid}/${revision}/approve`)
              .set('cookie', cookie)
              .expect(200)
              .end((err3, res3) => {
                t.is(err3, null, 'Should not have an error');
                t.true(includes(res3.text, 'action="/content/services/approve"'), 'should have correct form action url');
                t.true(includes(res3.text, 'Publish</button>'), 'Should have the final button in approval step');

                t.end();
              });
          });
      });
  });
});

test.cb('Content Approval Rejection', t => {
  addService(service).then(revision => {
    agent
      .get(`/content/services/${serviceUuid}/${revision}/approve`)
      .set('cookie', cookie)
      .expect(200)
      .end((err1, res1) => {
        t.is(err1, null, 'Should not have an error');
        t.true(includes(res1.text, 'action="/content/services/approve"'), 'should have correct form action url');
        t.true(includes(res1.text, 'Send to Editor</button>'), 'Should have the first button in approval step');

        t.end();
      });
  });
});

//////////////////////////////
// 404 Pages
//////////////////////////////
test.cb('404 Page', t => {
  agent
    .get('/foo')
    .set('cookie', cookie)
    .expect(404)
    .end(err => {
      t.is(err, null, 'Should not have an error');
      t.end();
    });
});

//////////////////////////////
// User Pages
//////////////////////////////
test.cb('Users Landing Page', t => {
  agent
    .get('/users')
    .set('cookie', cookie)
    .expect(200)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

      t.end();
    });
});

test.cb('Users Add Landing Page', t => {
  agent
    .get('/users/add')
    .set('cookie', cookie)
    .expect(200)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

      t.end();
    });
});

test.cb('Users Edit Landing Page', t => {
  agent
    .get(`/users/${accounts[1].id}/edit`)
    .set('cookie', cookie)
    .expect(200)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

      t.end();
    });
});

test.cb('Users Delete Landing Page', t => {
  agent
    .get(`/users/${accounts[1].id}/delete`)
    .set('cookie', cookie)
    .expect(200)
    .end((err, res) => {
      t.is(err, null, 'Should not have an error');
      t.regex(res.text, /DOCTYPE html/, 'should have an html doctype');

      t.end();
    });
});
