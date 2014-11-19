# Asterisk Voicemail Logging

Logging support for the Asterisk Voicemail application.

This module exposes an API for creating a logger for use in the Asterisk Voicemail application. It is based on the [bunyan](https://github.com/trentm/node-bunyan) module. It accepts a config object that can be used to configure the behavior of the logger as well as a component name to namespace log statements that will be outputted by the logger. Namespacing statements is useful when using the [CLI](https://github.com/trentm/node-bunyan#cli-usage) tool provided by bunyan.

# Installation

```bash
$ git clone https://github.com/asterisk/node-voicemail-logging.git
$ cd node-voicemail-logging
$ npm install -g .
```

or add the following to your package.json file

```JavaScript
"dependencies": {
  "voicemail-logging": "asterisk/node-voicemail-logging"
}
```

# Usage

```JavaScript
var config = {
  ari: {
    // uses Stasis application name as logger name
    applicationName: 'voicemail'
  },

  logging: {
    // display source file info in log statements?
    src: false,

    // non error log configuration
    normal: {
      // trace|debug|info
      level: 'info',
      // must have write access
      path: '/dir/info.log'
    },

    // error log configuration
    error: {
      // warn|error|fatal
      level: 'error',
      // must have write access
      path: '/dir/error.log'
    }
  }
};
var logger = require('voicemail-logging');
var log = logger.create(config, 'voicemail-component');
```

This will expose a [bunyan](https://github.com/trentm/node-bunyan#log-method-api) log object:

```JavaScript
log.info('message');
log.error({err: myError}, 'message');
```

# Development

After cloning the git repository, run the following to install the module and all dev dependencies:

```bash
$ npm install
$ npm link
```

Then run the following to run jshint and mocha tests:

```bash
$ grunt
```

jshint will enforce a minimal style guide. It is also a good idea to create unit tests when adding new features.

To generate a test coverage report run the following:

```bash
$ grunt coverage
```

This will also ensure a coverage threshold is met by the tests.

# License

Apache, Version 2.0. Copyright (c) 2014, Digium, Inc. All rights reserved.

