import cron from 'node-cron';
import { logger } from '../utils';
import { igFollowers, tiktokVideos, services } from '../actions';

const timezone = 'Asia/Tashkent';

async function uploadVideoTask() {
  const info = await tiktokVideos.getTikTokVideoInfo();
  await tiktokVideos.downloadTikTokVideo(info);
  services.convertVideoToBoxWithBlur();
  services.uploadVideoToIG();
  await tiktokVideos.postTikTokVideoInfo(info);
}

async function currentCountTask() {
  const mcount = await igFollowers.getCurrentIGFollowersCount('meawira');
  await igFollowers.postCurrentIGFollowersCount('meawira', mcount);

  const lcount = await igFollowers.getCurrentIGFollowersCount('lakrimoca');
  await igFollowers.postCurrentIGFollowersCount('lakrimoca', lcount);
}

cron.schedule(
  // '0 5,6,7,10,11,13,15,18,20,21,22,23 * * MON-FRI',
  '0 * * * MON-FRI',
  async () => {
    logger.info('Instagram upload video on MON-FRI cron task running');

    await uploadVideoTask();
  },
  { timezone }
);

cron.schedule(
  '0 9,10,11,12,13,14,18,20,21,22,23 * * SAT,SUN',
  async () => {
    logger.info('Instagram upload video on SAT-SUN cron task running');

    await uploadVideoTask();
  },
  { timezone }
);

cron.schedule('0 * * * *', async () => {
  logger.info('Instagram followers count cron task running');

  await currentCountTask();
});
