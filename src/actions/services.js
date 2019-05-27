import { promisify } from 'util';
// eslint-disable-next-line camelcase
import child_process from 'child_process';
import process from 'process';
import { logger } from '../util';

const exec = promisify(child_process.exec);

async function convertVideoToBoxWithBlur() {
  try {
    await exec(
      'ffmpeg -y -i "tmp/input.mp4" -vf scale=1080:1080 "tmp/container.mp4"'
    );
    await exec(
      'ffmpeg -y -i "tmp/container.mp4" -vf gblur=sigma=20 "tmp/blurred.mp4"'
    );
    await exec(
      `ffmpeg -y -i "tmp/input.mp4" -filter_complex "[0:v]scale='if(lt(in_h,in_w),1080,-1)':'if(lt(in_w,in_h),1080,-1)'" "tmp/content.mp4"`
    );
    await exec(
      'ffmpeg -y -i "tmp/container.mp4" -i "tmp/blurred.mp4" -filter_complex "[0:v][1:v]overlay=0:0" "tmp/mix.mp4"'
    );
    await exec(
      `ffmpeg -y -i "tmp/mix.mp4" -i "tmp/content.mp4" -filter_complex "[0:v][1:v]overlay='if(lt(h,w),0,(W-w)/2)':'if(lt(w,h),0,(H-h)/2)'" "tmp/output.mp4"`
    );
  } catch (error) {
    logger.error(error.message, () => process.exit(1));
  }
}

async function uploadVideoToIG() {
  try {
    await exec(
      `php php_service/index.php --title ' ' --path '${process.cwd()}/tmp/output.mp4'`
    );
  } catch (error) {
    logger.error(error.message, () => process.exit(1));
  }
}

export { convertVideoToBoxWithBlur, uploadVideoToIG };