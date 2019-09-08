var configurationController = require('./configurationController.js');
const log4js = require('log4js');

log4js.configure({
  appenders: { fractalFactory: { type: 'file', filename: configurationController.configurationVariables.logFile } },
  categories: { default: { appenders: ['fractalFactory'], level: configurationController.configurationVariables.logLevel } }
});

exports.logger = log4js.getLogger('fractalFactory');

exports.logger.info('Log running');
