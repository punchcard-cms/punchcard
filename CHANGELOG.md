# This Changelog Has Been Deprecated

Releases are rolled automatically, and each release has its own full changelog. Please refer to our [releases](https://github.com/punchcard-cms/punchcard/releases) for the changelog for each version. Please refer to our [contributing guidelines](https://github.com/punchcard-cms/punchcard/blob/master/CONTRIBUTING.md) to understand how we handle releases.

---

## v0.0.8
**May 12, 2016**

**New**

* Sunrise/sunset javascript/html
* Submit/cancel form buttons
* Empty form, ready for magicalNewForm

**Change**

* moving content-types templates
* integrate new punchcard-content-types changes

---

## v0.0.7
**May 4, 2016**

**New**

* database functions
    * helpers
    * separate table-creation functions
    * separate data-handling functions
* schema functions
* list a content type's entries

**Change**

* routes moved to `.lib`

**Removed**

* knex.js script/tests

---

## v0.0.6
**Apr 20, 2016**

**New**

* generic Punchcard content types routing
    * single file for all content types
    * routing removed from `./index.js`
* global variables (`siteName`, `contentTypesNames`)
* added npm `mock-express-response` module for testing knex
* added site-wide nav
    * includes auto-creation of content-types nav links
* new tests


**Change**

* removed redundant promises in `index.js`
* form template filename changed
* redirects to content type's landing on db save
* template cleanup
* remove hardcoded content types URLs and text

---

## v0.0.5
**Apr 13, 2016**

**New**

* knex database connections
* validation form template

---

## v0.0.4
**Mar 31, 2016**

**New**

* adjustments for input names in `settings`
* `/services/add` accepts inputs from form now.

---
## v0.0.3
**Mar 24, 2016**

**New**

* Integrated with Content Types module
* Added Services content type

**Changed**

* Converted configs to js modules

---

## v0.0.2
**Mar 2, 2016**

**New**

* Added application configuration via node-config
* Added express.js
  * Added express dev environment
* Added nunjucks templating
* Added many template placeholders
* Added routes
  * Added route: /
  * Added route: /content
  * Added per-route templates
* Tests application config working
* Tests if express creates server and routes
* Added supertest for testing
* Added tap-nyan for tap-spec reporter
* Added symlink in ./tests to ./views
  * errors were happening because the templates could not be found

**Changed**

* node version degraded to 4.3.1
* changes to reflect archetypical node module

---


## v0.0.1
**Feb 25, 2016**

**New**

* Cleaning out dev environment.
* Setup standard github repo
* Add .editorconfig
* Use Punchcard eslint configuration
* Add Ava testing
* Linting run before test suite is run

**Changed**

* travis build image points to Watson repo
* node version set at 5.7.0

**Removed**

* Remnants of POC App
* Mocha tests
