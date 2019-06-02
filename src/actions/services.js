import spawn from 'await-spawn';
import process from 'process';
import { logger, __line } from '../utils';

async function convertVideoToBoxWithBlur() {
  try {
    await spawn('ffmpeg', [
      '-y',
      '-i',
      'tmp/input.mp4',
      '-vf',
      'scale=1080:1080',
      'tmp/container.mp4',
    ]);
    await spawn('ffmpeg', [
      '-y',
      '-i',
      'tmp/container.mp4',
      '-vf',
      'gblur=sigma=20',
      'tmp/blurred.mp4',
    ]);
    await spawn('ffmpeg', [
      '-y',
      '-i',
      'tmp/input.mp4',
      '-filter_complex',
      "[0:v]scale='if(lte(in_h,in_w),1080,-1)':'if(lt(in_w,in_h),1080,-1)'",
      'tmp/content.mp4',
    ]);
    await spawn('ffmpeg', [
      '-y',
      '-i',
      'tmp/container.mp4',
      '-i',
      'tmp/blurred.mp4',
      '-filter_complex',
      '[0:v][1:v]overlay=0:0',
      'tmp/mix.mp4',
    ]);
    await spawn('ffmpeg', [
      '-y',
      '-i',
      'tmp/mix.mp4',
      '-i',
      'tmp/content.mp4',
      '-filter_complex',
      "[0:v][1:v]overlay='if(lt(h,w),0,(W-w)/2)':'if(lt(w,h),0,(H-h)/2)'",
      'tmp/output.mp4',
    ]);
  } catch (error) {
    logger.error(`${error.message} (${__line(error)} ${__filename})`);
  }
}

async function uploadVideoToIG() {
  try {
    await spawn('php', [
      'php_service/upload.php',
      '--title',
      ' ',
      '--path',
      `${process.cwd()}/tmp/output.mp4`,
    ]);
  } catch (error) {
    logger.error(`${error.message} (${__line(error)} ${__filename})`);
  }
}

async function followingAlgorithm() {
  try {
    await spawn('php', ['php_service/algorithm.php']);
  } catch (error) {
    logger.error(`${error.message} (${__line(error)} ${__filename})`);
  }
}

export default {
  convertVideoToBoxWithBlur,
  uploadVideoToIG,
  followingAlgorithm,
};
