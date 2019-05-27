<?php
set_time_limit(0);
date_default_timezone_set('UTC');

require __DIR__ . '/vendor/autoload.php';

// Load .env variables
$dotenv = Dotenv\Dotenv::create(__DIR__ . '/..');
$dotenv->overload();

// Caption text 
$hashtagsJson = file_get_contents(__DIR__ . '/../hashtags.json');
$hashtags = json_decode($hashtagsJson, true);
$captionText = 'Share and Enjoy!' . "\n\n";
$captionText .= $argv[2] . "\n\n";
foreach($hashtags['uzb-v1'] as $hashtag) {
  $captionText .= $hashtag . ' ';
}

// Load IG client
$ig = new \InstagramAPI\Instagram();

// Trying IG login
try {
  $ig->login($_ENV['IG_USERNAME'], $_ENV['IG_PASSWORD']);
} catch (\Exception $e) {
  echo $e->getMessage();
  exit(1);
}

// Trying IG upload video
try {
  $video = new \InstagramAPI\Media\Video\InstagramVideo($argv[4], ['forceAspectRatio' => 1.0]);
  $ig->timeline->uploadVideo($video->getFile(), ['caption' => $captionText]);
} catch (\Exception $e) {
  echo $e->getMessage();
  exit(1);
}
