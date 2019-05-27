import { logger, secrets } from './util';
import app from './app';
import './cron';

app.listen(secrets.EXPRESS_PORT, () => {
  logger.info(`App running on port http://localhost:${secrets.EXPRESS_PORT}`);
});
