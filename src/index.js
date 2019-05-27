import { logger } from './util';
import db from './db';

(async () => {
  await db.connect();
  const col = await db.getCollection('ig_meawira', 'followers_count');
  console.log(await col.find({}).count());
})();
