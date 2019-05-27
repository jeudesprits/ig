import { logger } from './util';
import { igFollowers, tiktokVideos } from './actions';

(async () => {
  console.log(await tiktokVideos.getTikTokVideoInfo());
})();
