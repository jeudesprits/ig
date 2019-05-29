<?php
set_time_limit(0);
date_default_timezone_set('UTC');

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/logger/logger.php';

// Logger
$logger = new Logger();

// Load .env variables
$dotenv = Dotenv\Dotenv::create(__DIR__ . '/..');
$dotenv->overload();

// Get list of profiles
$profilesJson = file_get_contents(__DIR__ . '/../profiles.json');
$profiles = json_decode($profilesJson, true);

// MongoDB client
$client = new MongoDB\Client($_ENV['MONGO_URI']);

// MongoDB collections
$visitedPostsCl = $client->ig_lakrimoca->visited_posts;
$followingsCl = $client->ig_lakrimoca->followings;

// Load IG client
$ig = new \InstagramAPI\Instagram();

// Trying IG login
try {
  $ig->login($_ENV['IG_LUSERNAME'], $_ENV['IG_LPASSWORD']);
} catch (\Exception $e) {
  $logger->error($e->getMessage());
  exit(1);
}

// Trying algorithm
try {
  $userId = $ig->people->getUserIdForName('sosanimal.uz');
  $posts =  $ig->timeline->getUserFeed($userId)->getItems();

  foreach ($posts as $post) {
    $postId = $post->getId();

    $document = $visitedPostsCl->findOne([
      'post_id' => $postId,
    ]);
    $prevMinId = $document !== NULL ? $document['cursor'] : NULL;
    $updateFlag = $document !== NULL;
    $isFirst = true;
    $mediaCommentsResponse = $document !== NULL
      ? $ig->media->getComments($postId, [
        "max_id" => $prevMinId,
      ])
      : $ig->media->getComments($postId);

    do {
      $minId = $mediaCommentsResponse->getNextMinId();

      if ($minId !== NULL && $prevMinId === $minId) {
        break;
      }
      $prevMinId = $minId;

      if ($isFirst && $prevMinId !== NULL && !$updateFlag) {
        $visitedPostsCl->insertOne([
          'post_id' => $postId,
          'cursor' => $prevMinId,
        ]);
      } else if ($isFirst && $prevMinId !== NULL && $updateFlag) {
        $visitedPostsCl->updateOne([
          ['post_id' => $postId],
          ['$set' => ['cursor' => $prevMinId]],
        ]);
      }

      $comments = $mediaCommentsResponse->getComments();

      foreach ($comments as $comment) {
        $commentUserId = $comment->getUserId();

        $friendshipsShowResponse = $ig->people->getFriendship($commentUserId);
        $isFollowing = $friendshipsShowResponse->getFollowing();

        if ($isFollowing) {
          continue;
        }

        $friendshipResponse = $ig->people->follow($commentUserId);

        $followingsCl->insertOne([
          'user_id' => $commentUserId,
          'created_at' => date(DateTime::ISO8601),
        ]);

        sleep(5);
      }

      if ($prevMinId !== NULL) {
        $mediaCommentsResponse = $ig->media->getComments($postId, [
          "min_id" => $prevMinId,
        ]);
      }

      $isFirst = false;
    } while ($prevMinId !== NULL);
  }
  //Encode the array into a JSON string.
  //$encodedString = json_encode($comments);
  //Save the JSON string to a text file.
  //file_put_contents('response.json', $encodedString);
} catch (\Exception $e) {
  $logger->error($e->getMessage());
  exit(1);
}
