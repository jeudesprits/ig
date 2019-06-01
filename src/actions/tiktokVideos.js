import axios from 'axios';
import fs from 'fs';
import { logger } from '../utils';
import db from '../db';

let isFirstRequest = true;

// eslint-disable-next-line camelcase
function isTikTokVideoPopular({ comment_count, digg_count }) {
  // eslint-disable-next-line camelcase
  return comment_count >= 30 && digg_count >= 30000;
}

// eslint-disable-next-line camelcase
async function isTikTokVideoUnique({ aweme_id }) {
  let document;

  try {
    await db.connect();
    const cl = await db.getCollection('ig_meawira', 'tik_tok_video-ids');
    document = await cl.findOne({ aweme_id });
  } catch (error) {
    logger.error(error.message, () => process.exit(1));
  }

  return document === null;
}

function getParams() {
  const destruction = isFirstRequest
    ? {
        min_cursor: '0',
        is_cold_start: '1',
      }
    : {};

  return {
    version_code: '11.5.0',
    'pass-region': '1',
    'pass-route': '1',
    language: 'en',
    app_name: 'musical_ly',
    vid: 'FE8A8461-CA66-4DDC-AD13-CB6723352249',
    app_version: '11.5.0',
    carrier_region: 'UZ',
    is_my_cn: '0',
    channel: 'TestFlight',
    mcc_mnc: '43407',
    device_id: '6693877311207638533',
    tz_offset: '18000',
    account_region: 'null',
    sys_region: 'US',
    aid: '1233',
    residence: 'UZ',
    screen_width: '1242',
    uoo: '0',
    openudid: '00c9f32ce9ad52939e6a15e887338357da3d1437',
    os_api: '18',
    ac: isFirstRequest ? '3G' : 'WIFI',
    os_version: '12.3.1',
    app_language: 'en',
    tz_name: 'Asia/Tashkent',
    current_region: 'UZ',
    device_platform: 'iphone',
    build_number: '115004',
    device_type: 'iPhone11,6',
    iid: '6695077002087270149',
    idfa: '9CD1034E-72C4-4E72-869D-519EF963D6EE',
    // eslint-disable-next-line prettier/prettier
    ad_user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    volume: '0.25',
    count: '6',
    ad_personality_mode: '1',
    feed_style: '0',
    type: '0',
    address_book_access: '0',
    filter_warn: '0',
    gps_access: '2',
    pull_type: isFirstRequest ? '0' : '2',
    resolution: '1242*2688',
    max_cursor: '0',
    // eslint-disable-next-line prettier/prettier
    bid_ad_params: 'H4sIAAAAAAAAE6vmUlBQSkyJz8xLy48vLcjJT0xRUrBSiAYKKyhUg0mggozUxJTU\n\novikzJSUzLx0sGKIKqiCWB2YyoKcxOTU3NS8kviSyoJUkCIlQwMDQ0NjA0MlsJpa\n\nIBnLVQsARV9EY3gAAAA=',
    ...destruction,
  };
}

function getHeaders() {
  return {
    // eslint-disable-next-line prettier/prettier
    'x-tt-token': '034de597a8a53af88a89f4ba3209ad59de99b374681ea3972e9f8c99688b2e074c0e691c1308b641ff26133c2441c99fed3',
    'sdk-version': '1',
    'user-agent': 'TikTok 11.5.0 rv:115004 (iPhone; iOS 12.3.1; en_US) Cronet',
    'accept-encoding': 'gzip, deflate',
    cookie: 'ttreq=1$d17c23efa2e6ebd18e4347d0555267d3cfd60fbe',
    'x-khronos': `${Date.now()}`,
    'x-pods': '',
    'x-gorgon': '8300fe5600001dff6f593972679ba95fdbc64b29738e453e6be5',
  };
}

async function getTikTokListOfVideos() {
  let list;

  try {
    const { data } = await axios.get(
      'https://api2-16-h2.musical.ly/aweme/v1/feed/',
      {
        headers: getHeaders(),
        params: getParams(),
      }
    );
    list = data.aweme_list;
  } catch (error) {
    logger.error(error.message, () => process.exit(1));
  }

  isFirstRequest = false;

  return list;
}

async function getTikTokVideoInfo() {
  const list = await getTikTokListOfVideos();

  for (const video of list) {
    if (
      isTikTokVideoPopular(video.statistics) &&
      (await isTikTokVideoUnique(video.statistics))
    ) {
      isFirstRequest = true;
      return video;
    }
  }

  return getTikTokVideoInfo();
}

// eslint-disable-next-line camelcase
async function postTikTokVideoInfo({ aweme_id }) {
  try {
    await db.connect();
    const cl = await db.getCollection('ig_meawira', 'tik_tok_video-ids');
    await cl.insertOne({ aweme_id });
  } catch (error) {
    logger.error(error.message, () => process.exit(1));
  }
}

async function downloadTikTokVideo(info) {
  let writer;

  try {
    const uri = info.video.play_addr_h264.url_list[0];
    const { data } = await axios.get(uri, { responseType: 'stream' });
    writer = fs.createWriteStream('tmp/input.mp4');
    data.pipe(writer);
  } catch (error) {
    logger.error(error.message, () => process.exit(1));
  }

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

export default { getTikTokVideoInfo, postTikTokVideoInfo, downloadTikTokVideo };
