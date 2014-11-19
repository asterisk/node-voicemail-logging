/**
 * Voicemail Logging unit tests.
 *
 * @module tests-logging
 * @copyright 2014, Digium, Inc.
 * @license Apache License, Version 2.0
 * @author Samuel Fortier-Galarneau <sgalarneau@digium.com>
 */

/*global describe:false*/
/*global beforeEach:false*/
/*global afterEach:false*/
/*global it:false*/

'use strict';

var assert = require('assert');
var mockery = require('mockery');
var fs = require('fs');
var path = require('path');

var mockeryOpts = {
  warnOnReplace: false,
  warnOnUnregistered: false,
  useCleanCache: true
};

/**
 * Returns a mock config for testing.
 */
var getMockConfig = function() {
  return {
    ari: {
      applicationName: 'voicemail'
    },

    logging: {
      src: false,

      normal: {
        level: 'info',
        path: './logs/info.log'
      },

      error: {
        level: 'error',
        path: './logs/error.log'
      }
    }
  };
};

describe('voicemail logging', function() {

  beforeEach(function(done) {

    mockery.enable(mockeryOpts);

    var mock = {
      createLogger: function(opts) {
        return {
          name: opts.name,
          src: opts.src,
          streams: opts.streams,

          child: function(opts) {
            this.component = opts.component;

            return this;
          }
        };
      },

      stdSerializers: {
        err: {}
      }
    };
    mockery.registerMock('bunyan', mock);

    done();
  });

  afterEach(function(done) {
    mockery.disable();

    var directory = path.resolve('./logs/');
    fs.rmdirSync(directory);

    done();
  });

  it('should create directory if it does not exist already', function(done) {
    var logger = require('../lib/logging.js');

    var log = logger.create(getMockConfig(), 'test');
    var directory = path.resolve('./logs/');

    assert(fs.existsSync(directory));
    done();
  });

  it('should return logger', function(done) {
    var logger = require('../lib/logging.js');

    var log = logger.create(getMockConfig(), 'test');

    assert(log.name === 'voicemail');
    assert(log.src === false);
    assert(log.component === 'test');

    var info = log.streams.filter(function(stream) {
      return stream.level === 'info';
    });
    var error = log.streams.filter(function(stream) {
      return stream.level === 'error';
    });

    assert(info.length === 2);
    assert(error.length === 2);

    done();
  });

});
