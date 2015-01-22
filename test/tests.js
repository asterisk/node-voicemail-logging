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
        path: './logs/info.log',
        stdout: true
      },

      error: {
        level: 'error',
        path: './logs/error.log',
        stderr: true
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
          serializers: opts.serializers,

          child: function(opts) {
            this.component = opts.component;

            return this;
          },

          trace: function() {},
          debug: function() {},
          info: function() {},
          warn: function() {},
          error: function() {},
          fatal: function() {},
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

  it('should allow disabling stdout and stderr', function(done) {
    var logger = require('../lib/logging.js');

    var config = getMockConfig();
    config.logging.normal.stdout = false;
    config.logging.error.stderr = false;

    var log = logger.create(config, 'test');

    var info = log.streams.filter(function(stream) {
      return stream.level === 'info';
    });
    var error = log.streams.filter(function(stream) {
      return stream.level === 'error';
    });

    assert(info.length === 1);
    assert(error.length === 1);

    done();
  });

  it('should have all serializers', function(done) {
    var logger = require('../lib/logging.js');

    var log = logger.create(getMockConfig(), 'test');

    var result = log.serializers.query({text: 'test', values: 'it'});
    assert(result.query.text === 'test' && result.query.values === 'it');

    result = log.serializers.channel({id: '1', name: 'alice'});
    assert(result.channel.id === '1' && result.channel.name === 'alice');

    result = log.serializers.playback({
      'media_uri': 'uri',
      'target_uri': 'channel'
    });
    assert(result.playback.media === 'uri' &&
           result.playback.target === 'channel');

    result = log.serializers.recording({
      name: 'recording',
      'target_uri': 'channel'
    });
    assert(result.recording.name === 'recording' &&
           result.recording.target === 'channel');

    result = log.serializers.message({
      getId: function() {return 1;},
      getMailbox: function() {return {getId: function() {return 2;}};},
      getFolder: function() {return {getId: function() {return 3;}};},
      date: {
        format: function() {return 'now';}
      },
      read: false,
      callerId: 'me',
      duration: 1,
      recording: 'recording'
    });
    assert(result.message.id === 1 &&
           result.message.mailboxId === 2 &&
           result.message.folderId === 3 &&
           result.message.date === 'now' &&
           result.message.read === false,
           result.message.duration === 1 &&
           result.message.recording === 'recording');

    result = log.serializers.context({
      getId: function() {return 1;},
      domain: 'email.com'
    });
    assert(result.context.id === 1 && result.context.domain === 'email.com');

    result = log.serializers.contextConfig({
      getId: function() {return 1;},
      key: 'config key',
      value: 'config value'
    });
    assert(result.contextConfig.id === 1 &&
           result.contextConfig.key === 'config key' &&
           result.contextConfig.value === 'config value');

    result = log.serializers.contextConfigs([{
      getId: function() {return 1;}
    }, {
      getId: function() {return 2;}
    }]);
    assert(result.ids[0] === 1 && result.ids[1] === 2);

    result = log.serializers.mailboxConfig({
      getId: function() {return 1;},
      key: 'config key',
      value: 'config value'
    });
    assert(result.mailboxConfig.id === 1 &&
           result.mailboxConfig.key === 'config key' &&
           result.mailboxConfig.value === 'config value');

    result = log.serializers.mailboxConfigs([{
      getId: function() {return 1;}
    }, {
      getId: function() {return 2;}
    }]);
    assert(result.ids[0] === 1 && result.ids[1] === 2);

    result = log.serializers.folder({
      getId: function() {return 1;},
      name: 'inbox',
      dtmf: '1'
    });
    assert(result.folder.id === 1 &&
           result.folder.name === 'inbox' &&
           result.folder.dtmf === '1');

    result = log.serializers.folders([{
      name: 'inbox'
    }, {
      name: 'old'
    }]);
    assert(result.names[0] === 'inbox' &&
           result.names[1] === 'old');

    result = log.serializers.mailbox({
      getId: function() {return 1;},
      mailboxNumber: '1',
      mailboxName: 'mailbox'
    });
    assert(result.mailbox.id === 1 &&
           result.mailbox.mailboxNumber === '1' &&
           result.mailbox.mailboxName === 'mailbox');

    result = log.serializers.messages([{
      getId: function() {return 1;},
    }, {
      getId: function() {return 2;},
    }]);
    assert(result.ids[0] === 1 &&
           result.ids[1] === 2);

    done();
  });

});
