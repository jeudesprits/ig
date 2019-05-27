import { execSync } from 'child_process';
import process from 'process';
import { logger } from '../util';

function convertVideoToBoxWithBlur() {
  try {
    execSync(
      'ffmpeg -y -i "tmp/input.mp4" -vf scale=1080:1080 "tmp/container.mp4"'
    );
    execSync(
      'ffmpeg -y -i "tmp/container.mp4" -vf gblur=sigma=20 "tmp/blurred.mp4"'
    );
    execSync(
      `ffmpeg -y -i "tmp/input.mp4" -filter_complex "[0:v]scale='if(lt(in_h,in_w),1080,-1)':'if(lt(in_w,in_h),1080,-1)'" "tmp/content.mp4"`
    );
    execSync(
      'ffmpeg -y -i "tmp/container.mp4" -i "tmp/blurred.mp4" -filter_complex "[0:v][1:v]overlay=0:0" "tmp/mix.mp4"'
    );
    execSync(
      `ffmpeg -y -i "tmp/mix.mp4" -i "tmp/content.mp4" -filter_complex "[0:v][1:v]overlay='if(lt(h,w),0,(W-w)/2)':'if(lt(w,h),0,(H-h)/2)'" "tmp/output.mp4"`
    );
  } catch (error) {
    logger.error(error.message, () => process.exit(1));
  }
}

function uploadVideoToIG() {
  try {
    execSync(
      `php php_service/index.php --title ' ' --path '${process.cwd()}/tmp/output.mp4'`
    );
  } catch (error) {
    logger.error(error.message, () => process.exit(1));
  }
}

export default { convertVideoToBoxWithBlur, uploadVideoToIG };
