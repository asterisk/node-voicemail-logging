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
      err: bunyan.stdSerializers.err,

      query: function(query) {
        return {
          query: {
            text: query.text,
            values: query.values
          }
        };
      },

      channel: function(channel) {
        return {
          channel: {
            id: channel.id,
            name: channel.name
          }
        };
      },

      playback: function(playback) {
        return {
          playback: {
            media: playback['media_uri'],
            target: playback['target_uri']
          }
        };
      },

      recording: function(recording) {
        return {
          recording: {
            name: recording.name,
            target: recording['target_uri']
          }
        };
      },

      message: function(message) {
        return {
          message: {
            id: message.getId(),
            mailboxId: message.getMailbox().getId(),
            folderId: message.getFolder().getId(),
            date: message.date.format(),
            read: message.read,
            callerId: message.callerId,
            duration: message.duration,
            recording: message.recording
          }
        };
      },

      context: function(context) {
        return {
          context: {
            id: context.getId(),
            domain: context.domain
          }
        };
      },

      contextConfig: function(contextConfig) {
        return {
          contextConfig: {
            id: contextConfig.getId(),
            key: contextConfig.key,
            value: contextConfig.value
          }
        };
      },

      contextConfigs: function(contextConfigs) {
        var ids = contextConfigs.map(function(contextConfig) {
          return contextConfig.getId();
        });

        return {
          ids: ids
        };
      },

      mailboxConfig: function(mailboxConfig) {
        return {
          mailboxConfig: {
            id: mailboxConfig.getId(),
            key: mailboxConfig.key,
            value: mailboxConfig.value
          }
        };
      },

      mailboxConfigs: function(mailboxConfigs) {
        var ids = mailboxConfigs.map(function(mailboxConfig) {
          return mailboxConfig.getId();
        });

        return {
          ids: ids
        };
      },

      folder: function(folder) {
        return {
          folder: {
            id: folder.getId(),
            name: folder.name,
            dtmf: folder.dtmf
          }
        };
      },

      folders: function(folders) {
        var names = folders.map(function(folder) {
          return folder.name;
        });

        return {
          names: names
        };
      },

      mailbox: function(mailbox) {
        return {
          mailbox: {
            id: mailbox.getId(),
            mailboxNumber: mailbox.mailboxNumber,
            mailboxName: mailbox.mailboxName
          }
        };
      },

      messages: function(messages) {
        var ids = messages.map(function(message) {
          return message.getId();
        });

        return {
          ids: ids
        };
      }
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
