# Contributing to @libscie/hyperdaemon

Welcome! We _love_ that you're interested in contributing to Liberate Science :purple_heart:

We recognize all our contributors using the [all-contributors](https://github.com/all-contributors/all-contributors) bot. Contributions of any kind welcome!

Come and join us on [Slack](https://join.slack.com/t/libscie/shared_invite/zt-9l0ig1x1-Sxjun7D6056cOUQ2Ai_Bkw) to chat with our team and stay up to date with all [Liberate Science](https://libscie.org) goings-on.

## Code of conduct

Please note we adhere to a [Code of Conduct](https://github.com/hypergraph-xyz/cli/blob/master/CODE_OF_CONDUCT.md) and any contributions not in line with it (_tl;dr_ be an empathetic, considerate person) will not be accepted. Please notify [@chartgerink](mailto:chris@libscie.org) if anything happens.

## Feature requests & bug reports

Feature requests and bug reports can be submitted through [GitHub issues](https://github.com/libscie/hyperdaemon/issues).

We offer templates for feature requests and bug reports.

### Security vulnerabilities

Please report security vulnerabilities directly to [@chartgerink](mailto:chris@libscie.org).

## Contributing code

### Where to start?

Our work is organized on [GitHub Issues](https://github.com/libscie/hyperdaemon/issues). If you're enthusiastic about one of these features, come and discuss it with us on [Slack](https://libscie.slack.com/) ([invite link](https://join.slack.com/t/libscie/shared_invite/zt-9l0ig1x1-Sxjun7D6056cOUQ2Ai_Bkw)). You might also find the [Hypergraph glossary](https://www.notion.so/Glossary-d4bdf18fb4624c049c7a2663559ef5ad) useful as it explains some of the product-specific terminology we use as an organization.

Technical improvements, bug fixes, documentation and other non-feature work is also totally welcome.

### Git guidelines

When starting work on an issue, please comment to say you're working on it. Create a fork for your work and submit a pull request that closes the issue when done. If you'd like input along the way, a draft pull request is also fine. Please invite recent contributors to review (at least one, but preferably two or more). Project maintainers will take care of releases and labels, etc. Feel free to ask questions at any time.

In general the ideal PR process looks like this (just for reference):

#### Step 1: Fork

Fork the project [on GitHub](https://github.com/libscie/hyperdaemon) and check out your copy locally.

```bash
$ git clone git@github.com:username/hyperdaemon.git
$ cd hyperdaemon
$ npm install
$ git remote add upstream git://github.com/libscie/hyperdaemon.git
```

#### Step 2: Branch

Create a feature branch and start hacking:

```bash
$ git checkout -b my-feature-branch -t origin/master
```

#### Step 3: Test

Bug fixes and features **should come with tests**.

```bash
$ npm test
```

#### Step 4: Commit

Make sure git knows your name and email address:

```bash
$ git config --global user.name "Bruce Wayne"
$ git config --global user.email "bruce@batman.com"
```

Writing good commit logs is important. A commit log should describe what changed and why.

#### Step 5: Push

```bash
$ git push origin my-feature-branch
```

#### Step 6: Make a pull request ;)

### Documentation

If your work adds functionality or changes the way existing functionality works, please document this in the [README.md](https://github.com/libscie/hyperdaemon/blob/master/README.md).
