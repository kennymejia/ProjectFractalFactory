/*
Description: Controls and offers an inferface for writing to a log file. This is mostly
             overshadowed by PM2's logging but remains as an additional tool.
Contributor(s): Eric Stenton
 */

const dotenv = require('dotenv');
dotenv.config();

const log4js = require('log4js');

log4js.configure({
  appenders: { fractalFactory: { type: 'file', filename: process.env.LOGFILE } },
  categories: { default: { appenders: ['fractalFactory'], level: process.env.LOGLEVEL } }
});

exports.logger = log4js.getLogger('fractalFactory');

exports.logger.info('Log running');
