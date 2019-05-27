"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _winstonCallback = require("winston-callback");

var _winstonTelegram = _interopRequireDefault(require("winston-telegram"));

var _path = _interopRequireDefault(require("path"));

var _isProd = _interopRequireDefault(require("./isProd"));

var _secrets = _interopRequireDefault(require("./secrets"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line new-cap
const logger = new _winstonCallback.createLogger({
  level: _isProd.default ? 'info' : 'debug',
  format: _winstonCallback.format.combine(_winstonCallback.format.label({
    label: _path.default.basename(__filename)
  }), _winstonCallback.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }))
});

if (_isProd.default) {
  logger.add(new _winstonCallback.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: _winstonCallback.format.combine(_winstonCallback.format.printf(info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`))
  }));
  logger.add(new _winstonCallback.transports.File({
    filename: 'logs/combined.log',
    format: _winstonCallback.format.combine(_winstonCallback.format.printf(info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`))
  }));
  logger.add(new _winstonTelegram.default({
    token: _secrets.default.TG_TOKEN,
    chatId: _secrets.default.TG_CHANNEL_NAME,
    disableNotification: true,
    formatMessage: info => `\`\`\` ${info.level} [${info.label}]: ${info.message} \`\`\``
  }));
} else {
  logger.add(new _winstonCallback.transports.Console({
    format: _winstonCallback.format.combine(_winstonCallback.format.colorize(), _winstonCallback.format.printf(info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`))
  }));
}

var _default = logger;
exports.default = _default;