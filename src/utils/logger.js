import { createLogger, transports, format } from 'winston-callback';
import TelegramLogger from 'winston-telegram';
import path from 'path';
import isProduction from './isProd';
import secrets from './secrets';

// eslint-disable-next-line new-cap
const logger = new createLogger({
  level: isProduction ? 'info' : 'debug',
  format: format.combine(
    format.label({ label: '👿🤒😾🙀😑' }),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
});

if (isProduction) {
  logger.add(
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: format.combine(
        format.printf(
          info =>
            `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`
        )
      ),
    })
  );
  logger.add(
    new transports.File({
      filename: 'logs/combined.log',
      format: format.combine(
        format.printf(
          info =>
            `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`
        )
      ),
    })
  );
  logger.add(
    new TelegramLogger({
      token: secrets.TG_TOKEN,
      chatId: secrets.TG_CHANNEL_NAME,
      disableNotification: true,
      formatMessage: info =>
        `\`\`\` ${info.level} [${info.label}]: ${info.message} \`\`\``,
    })
  );
} else {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          info =>
            `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`
        )
      ),
    })
  );
}

export default logger;
