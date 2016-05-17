# Punchcard CMS [![Build Status](https://travis-ci.org/punchcard-cms/punchcard.svg?branch=master)](https://travis-ci.org/punchcard-cms/punchcard) [![Coverage Status](https://coveralls.io/repos/github/punchcard-cms/punchcard/badge.svg?branch=master)](https://coveralls.io/github/punchcard-cms/punchcard?branch=master) [![Code Climate](https://codeclimate.com/github/punchcard-cms/punchcard/badges/gpa.svg)](https://codeclimate.com/github/punchcard-cms/punchcard)

Headless Content Management System designed with content strategy at its heart. Built with Node.

## Developing Locally

Make sure PostgresSQL is set up locally (see below)

Run the following to run both the database and get the server running:

```bash
$ npm run dev
```

## Setting up PostgreSQL locally

1. Make sure you have homebrew installed
`/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`
2. `brew update`
3. `brew install postgres`
4. type this to start the postgres server `postgres -D /usr/local/var/postgres`
5. open new terminal tab
6.` createuser punchcard -P` (it'll prompt for a password) use ‘W@ts0n'
7. `createdb -O punchcard punchcard`
8. reconnect to psql as new user `psql -d punchcard -U punchcard`
9. connect to db `\connect punchcard`

Once you are connected you should be able to use psql cli syntax to check tables.
* `\d+` checks table relations
* `\l` lists all available databases
* `select * from "database_name";` Displays all rows in database, replacing database_name with the table you want to see.
* list all tables for user punchcard: `\c punchcard \dt`


