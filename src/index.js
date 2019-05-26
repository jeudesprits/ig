import process from 'process';
import { logger } from './util/index';
import db from './db/db';

(async () => {
  await db.connect();
  const col = await db.getCollection('ig_meawira', 'followers_count');
  console.log(await col.find({}).count());
})();
