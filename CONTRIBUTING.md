# Contributing to Punchcard

Punchcard is a headless CMS designed with content strategy at its heart. With a focus on content management and content management only, it reinforces at its heart the [create once, publish everywhere](http://www.programmableweb.com/news/cope-create-once-publish-everywhere/2009/10/13) mentality of reusable content.

 Punchcard, and its [related components](https://github.com/punchcard-cms), are all covered by these contributing guidelines, as well as the [Apache License 2.0](http://spdx.org/licenses/Apache-2.0).

## Submitting Issues

* Before creating a new issue, perform a [cursory search](https://github.com/issues?utf8=%E2%9C%93&q=is%3Aissue+user%3Apunchcard-cms) to see if a similar issue has already been submitted. Similar issues may have different names than what you would have written, and may have been closed.
* Can create an issue in the most relevant repository. If unable to determine which one that is, file an issue in this repository. It may be moved.
* Please follow our [Issue Guidelines](#issue-guidelines) when creating a new issue.
* Do not open a [pull request](#pull-requests) to resolve an issue without first receiving feedback from a `Punchcard CMS member` and having them agree on a solution forward.
* Include screenshots and animated GIFs whenever possible; they are immensely helpful.
* When submitting a browser bug, please include the browser, version, operating system, and operating system version.
* When submitting an update to or a new feature, pattern, guideline, etc… we prefer to see user research associated with the suggestion including testing methods, results, and sample size, whenever possible. This allows us to make more user-centered decisions and cut through assumptions and individual preferences.
* Issues that have a number of sub-items that need to be complete should use [task lists](https://github.com/blog/1375%0A-task-lists-in-gfm-issues-pulls-comments) to track the sub-items in the main issue comment.

## Pull Requests

* **DO NOT ISSUE A PULL REQUEST WITHOUT FIRST [SUBMITTING AN ISSUE](#submitting-issues)**
* **ALL PULL REQUESTS MUST INCLUDE A [DEVELOPER CERTIFICATE OF ORIGIN](#developer-certificate-of-origin)**
* Pull requests should reference their related issues. If the pull request closes an issue, [please reference its closing from a commit messages](https://help.github.com/articles/closing-issues-via-commit-messages/). Pull requests not referencing any issues will be closed.
* Commit messages _must_ begin with the [relevant emoji](#emoji-cheatsheet) describing what the commit does.
* Pull request titles should be descriptive, explaining at the high level what it is doing, and should be written in the same style as [commit messages](#git-commit-messages).
* Include a summarized list of changes, additions, and deletions in the body of the pull request in the same style as [commit messages](#git-commit-messages).
* Follow our JavaScript and CSS styleguides. We have linters set up to catch most of it.
* Ensure that [EditorConfig](http://editorconfig.org/) installed in the editor used to work on the site and that it is functioning properly.
* Do not squash or rebase commits when submitting a Pull Request. It makes it much harder to follow work and make incremental changes.
* Ensure no Emoji tags are used in the title of the Pull Request

### Developer Certificate of Origin

All contributions to the Watson Design Guideline must be accompanied by acknowledgment of, and agreement to, the [Developer Certificate of Origin](http://elinux.org/Developer_Certificate_Of_Origin), reproduced below. Acknowledgment of and agreement to the Developer Certificate of Origin _must_ be included in the comment section of each contribution and _must_ take the form of `DCO 1.1 Signed-off-by: {{Full Name}} <{{email address}}>` (without the `{{}}`). Contributions without this acknowledgment will be required to add it before being accepted. If a contributor is unable or unwilling to agree to the Developer Certificate of Origin, their contribution will not be included.

```
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.
660 York Street, Suite 102,
San Francisco, CA 94110 USA

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.

Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

### Git Commit Messages

* Use the present tense (`"Add feature"` not `"Added Feature"`)
* Use the imperative mood (`"Move cursor to…"` not `"Moves cursor to…"`)
* Limit the first line to 72 characters or less
* Include relevant Emoji from our [Emoji cheatsheet](#emoji-cheatsheet)

### Branching Model

* Branches must be made off of the most current `master` branch of a repository
* Branch names should be descriptive, describing what is being done in that branch
* Pull requests must be made back in to the `master` branch for a repository
* The following branch prefixes should be used when creating a new branch:
  * `hotfix/` - bug fixes that got through and need to be squashed
  * `release/` - for releases
  * `feature/` - update to or new functionality

## Creating a New Version

Versioning is done through [SEMVER](http://semver.org/). When issuing a new version, create a [release branch](#branching-model) with the version's name in to the `master` branch. The release branch should bump the version number accordingly and [update the changelog](#maintaining-the-changelog). Once merged, create a new tag with `v` prefixed with the version's name from that branch.

For instance, when creating version `1.1.0`, start by creating a release branch `release/1.1.0` that includes the version bump and changelog updates, merge it in to `master` and create a tag `v1.1.0` from branch `release/1.1.0`.

### Maintaining the Changelog

The Changelog should have a list of changes made for each version. They should be organized so additions come first, changes come second, and deletions come third. Version numbers should be 2nd level headers with the `v` in front (like a tag) and the date of the version's most recent update should be underneath in italics.

Changelog messages do not need to cover each individual commit made, but rather should have individual summaries of the changes made. Changelog messages should be written in the same style as [commit messages](#git-commit-messages).

## Issue Guidelines

There are generally two kinds of issues: requests functionality or bugs. Each is treated slightly differently, and there is a template for each.

#### New Functionality

[Request New Functionality](https://github.com/punchcard-cms/punchcard/issues/new?body=%7B%7Blong%20description%7D%7D%0A%0A%60%60%60gherkin%0AFeature%3A%20%7B%7Bfeature%7D%7D%0A%20%20As%20a%20%7B%7Bpersona%7D%7D%0A%20%20I%20want%20%7B%7Bneed%7D%7D%0A%20%20So%20that%20%7B%7Brationale%7D%7D%0A%0A%20%20Scenario%3A%20%7B%7Bscenario%7D%7D%0A%20%20%20%20Given%20%7B%7Bthing%7D%7D%0A%20%20%20%20When%20%7B%7Baction%7D%7D%0A%20%20%20%20Then%20%7B%7Bresult%7D%7D%0A%60%60%60%0A%0A---%0A%0A-%20%5B%20%5D%20%7B%7Bfeature%7D%7D%2F%7B%7Bscenario%7D%7D&title=%7B%7Bpersona%7D%7D%3A%20%7B%7Bneed%7D%7D)

New functionality always exists in relation to a specific type of user. When requesting new functionality, include the user persona the functionality relates to, the need, and the version of the codebase. Titles should be written with the user persona first, then the a short description of their need (5-10 words).

New functionality also needs their requirements for being considered complete written out. To do so, features and scenarios should be written to describe the expected behavior in [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin) syntax. Each feature and scenario par should have a [task list](https://github.com/blog/1375%0A-task-lists-in-gfm-issues-pulls-comments) created to track their completion. The issue is considered **done** when all feature/scenario pairs defined have been completed with passing tests written.

The following can be copied as a templates to follow:

**Title**

    {{persona}}: {{need}}

**Body**

    {{long description}}
    
    ```gherkin
    Feature: {{feature}}
      As a {{persona}}
      I want {{need}}
      So that {{rationale}}
    
      Scenario: {{scenario}}
        Given {{thing}}
        When {{action}}
        Then {{result}}
    ```
    
    ---
    
    - [ ] {{feature}}/{{scenario}}


### Bug Report

[File a Bug Report](https://github.com/punchcard-cms/punchcard/issues/new?body=%7B%7Blong%20description%7D%7D%0A%0A%23%23%20Steps%20for%20Reproducing%0A%0A-%20%7B%7BStep%201%7D%7D%0A-%20%7B%7BStep%202%7D%7D%0A-%20%7B%7BStep%203%7D%7D%0A%0A%23%23%20Screenshots%0A%0A%23%23%23%20%7B%7BStep%201%7D%7D%0A%0A!%5BScreenshot%20of%20Step%201%5D(url%2Fto%2Fscreenshot)%0A%0A%23%23%23%20%7B%7BStep%202%7D%7D%0A%0A!%5BScreenshot%20of%20Step%202%5D(url%2Fto%2Fscreenshot)%0A%0A%23%23%23%20%7B%7BStep%203%7D%7D%0A%0A!%5BScreenshot%20of%20Step%203%5D(url%2Fto%2Fscreenshot)%0A%0A%23%23%20Affected%20Browsers%0A%0A-%20%5B%20%5D%20%7B%7BChrome%2047%20on%20Mac%2010.11%7D%7D%20%2F%20%7B%7BProduction%2C%20Development%7D%7D%0A-%20%5B%20%5D%20%7B%7BChrome%2047%20on%20Windows%2010%7D%7D%20%2F%20%7B%7BProduction%2C%20Development%7D%7D%0A-%20%5B%20%5D%20%7B%7BFirefox%2038.4%20on%20Mac%2010.11%7D%7D%20%2F%20%7B%7BDevelopment%7D%7D%0A%0A%23%23%20Runtime%20Version%0A%0A%7B%7Bruntime%20version%7D%7D%0A%0A%23%23%20Code%20Version%0A%0A%7B%7Bcode%20version%7D%7D&title=Bug%3A%20%7B%7Bshort%20description%7D%7D)

Bug reports represent a problem in our codebase. If the problem exists because something isn't working as it was designed and implemented to work, it should be filed as a bug report. If the problem exists because something isn't working as expected or working as liked but _is_ working as it was designed and implemented to work, it should be requested as a [new functionality](#new-functionality). Titles should be written with the `Bug:` first, then the a short description of the problem (5-10 words).

Bug reports should all include the following information:

* Long description of problem
* Step-by-step instructions on how to reproduce the problem
* Screenshots and if possible animated GIFs (ideally at least one for every step)
* Browsers, browser versions, operating systems, and operating system versions affected (for in-browser bugs)
* Runtime version affected (for non-browser bugs, _i.e._ Node version)
* Code version being used

The following can be copied as a templates to follow:

**Title**

    Bug: {{short description}}

**Body**

    {{long description}}
    
    ## Steps for Reproducing
    
    - {{Step 1}}
    - {{Step 2}}
    - {{Step 3}}
    
    ## Screenshots
    
    ### {{Step 1}}
    
    ![Screenshot of Step 1](url/to/screenshot)
    
    ### {{Step 2}}
    
    ![Screenshot of Step 2](url/to/screenshot)
    
    ### {{Step 3}}
    
    ![Screenshot of Step 3](url/to/screenshot)
    
    ## Affected Browsers
    
    - [ ] {{Chrome 47 on Mac 10.11}} / {{Production, Development}}
    - [ ] {{Chrome 47 on Windows 10}} / {{Production, Development}}
    - [ ] {{Firefox 38.4 on Mac 10.11}} / {{Development}}
    
    ## Runtime Version
    
    {{runtime version}}
    
    ## Code Version
    
    {{code version}}

## Emoji Cheatsheet

When creating creating commits or updating the CHANGELOG, please **start** the commit message or update with one of the following applicable Emoji. Emoji should not be used at the start of issue or pull request titles.

* :new: `:new:` when adding new functionality
* :boom: `:boom:` when changing in a non-backwards-compatible way current functionality
* :bug: `:bug:` when fixing a bug
* :memo: `:memo:` when writing long-form text (documentation, guidelines, principles, etc…)
* :art: `:art:` when improving the format/structure of the code
* :racehorse: `:racehorse:` when improving performance
* :fire: `:fire:` when removing code or files
* :green_heart: `:green_heart:` when fixing the CI build
* :white_check_mark: `:white_check_mark:` when adding tests
* :lock: `:lock:` when dealing with security
* :arrow_up: `:arrow_up:` when upgrading dependencies
* :arrow_down: `:arrow_down:` when downgrading dependencies
* :shirt: `:shirt:` when removing linter warnings
* :crystal_ball: `:crystal_ball:` when experimenting
* :shipit: `:shipit:` when creating a new release
