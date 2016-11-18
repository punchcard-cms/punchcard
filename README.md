# Punchcard CMS [![Build Status](https://travis-ci.org/punchcard-cms/punchcard.svg?branch=master)](https://travis-ci.org/punchcard-cms/punchcard) [![Coverage Status](https://coveralls.io/repos/github/punchcard-cms/punchcard/badge.svg?branch=master)](https://coveralls.io/github/punchcard-cms/punchcard?branch=master) [![Code Climate](https://codeclimate.com/github/punchcard-cms/punchcard/badges/gpa.svg)](https://codeclimate.com/github/punchcard-cms/punchcard)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/punchcard-cms/demo)

Headless Content Management System designed with content strategy at its heart. Built with Node.

## Install and Usage

```bash
npm i punchcard-cms --save
```

```javascript
const punchcard = require('punchcard-cms');

punchcard().then(app => {
  app.listen(8080);
})
```

## Setting File Storage

Punchcard uses any [Vinyl Adapter](https://www.npmjs.com/package/vinyl#what-is-a-vinyl-adapter) that your heart desires. A good first place to start is searching for [vinyl on NPM](https://www.npmjs.com/search?q=vinyl). Punchcard assumes all vinyl adapters are named `vinyl-adapter`.

## Developing Locally

Make sure PostgresSQL is set up locally (see below)

Install all the things

```bash
npm install
```

Run the following to run both the database and get the server running:

```bash
$ npm run dev
```

## Setting up PostgreSQL locally

1. Make sure you have homebrew installed: `/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`

2. `brew update`
3. `brew install postgres`
4. start the postgres server: `postgres -D /usr/local/var/postgres`

5. open new terminal tab
6. create a postgres user (it'll prompt for a password use `W@ts0n`): `createuser punchcard -P`

7. Create local CMS database: `createdb -O punchcard punchcard`

8. Create local test database: `createdb -O punchcard punchcard_test`

9. reconnect to psql as new user: `psql -d punchcard -U punchcard`

10. connect to db: `\connect punchcard`

Once you are connected you should be able to use psql cli syntax to check tables.
* `\d+` checks table relations
* `\l` lists all available databases
* `select * from "database_name";` Displays all rows in database, replacing database_name with the table you want to see.
* list all tables for user punchcard: `\c punchcard \dt`

## Changelog

See the [latest release](https://github.com/punchcard-cms/punchcard/releases/latest) for the most recent changelog
