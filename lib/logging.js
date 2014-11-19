/**
 * Voicemail logging.
 *
 * @module logging
 * @copyright 2014, Digium, Inc.
 * @license Apache License, Version 2.0
 * @author Samuel Fortier-Galarneau <sgalarneau@digium.com>
 */

'use strict';

var bunyan = require('bunyan');
var path = require('path');
var fs = require('fs');

/**
 * Creates the parent directory of the given path if it does not exist.
 *
 * @param {string} path - path to a log file
 */
function ensureDirectoryExists(file) {
  var absolutePath = path.resolve(file);
  var directory = path.dirname(absolutePath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, '0755');
  }
}

/**
 * Returns a log using the provided config and component name.
 *
 * @param {object} config - configuration object that contains a logging config
 * @param {string} component - the name of the component tied to the returned
 *                             log
 */
function create(config, component) {
  ensureDirectoryExists(config.logging.normal.path);
  ensureDirectoryExists(config.logging.error.path);

  var log = bunyan.createLogger({
    name: config.ari.applicationName, // stasis application name

    src: config.logging.src,
    
    streams: [
      {
        level: config.logging.normal.level,
        stream: process.stdout
      },

      {
        level: config.logging.normal.level,
        path: path.resolve(config.logging.normal.path)
      },

      {
        level: config.logging.error.level,
        stream: process.stderr
      },

      {
        level: config.logging.error.level,
        path: path.resolve(config.logging.error.path)
      }
    ],

    serializers: {
      err: bunyan.stdSerializers.err
    }
  });

  return log.child({component: component});
}

/**
 * Returns module functions.
 *
 * @returns {object} module - module functions
 */
module.exports = {
  create: create
};
