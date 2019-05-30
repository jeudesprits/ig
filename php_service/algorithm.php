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
  $userId = $ig->people->getUserIdForName('leo_17s');
  $posts__ =  $ig->timeline->getUserFeed($userId)->getItems();
  $posts = [$posts__[0]];

  foreach ($posts as $post) {
    $postId = $post->getId();

    $document = $visitedPostsCl->findOne([
      'post_id' => $postId,
    ]);
    $cursor = $document !== NULL ? $document['cursor'] : NULL;
    $mediaCommentsResponse = $document !== NULL
      ? $ig->media->getComments($postId, [
        "max_id" => $prevMinId,
      ])
      : $ig->media->getComments($postId);
    $initialOnPost = $document === NULL;
    $isFirstStep = true;
    $comments = $mediaCommentsResponse->getComments();

    do {
      // Encode the array into a JSON string.
      $encodedString = json_encode($comments);
      // Save the JSON string to a text file.
      file_put_contents('response.json', $encodedString . "\n\n", FILE_APPEND);

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

      $newCursor = $mediaCommentsResponse->getNextMinId();

      if ($newCursor !== NULL) {
        $mediaCommentsResponse = $initialOnPost
          ? $ig->media->getComments($postId, [
            "min_id" => $newCursor,
          ])
          : $ig->media->getComments($postId, [
            "max_id" => $newCursor,
          ]);
        $comments = $mediaCommentsResponse->getComments();

        if ($isFirstStep) {
          if ($cursor === NULL) {
            $visitedPostsCl->insertOne([
              'post_id' => $postId,
              'cursor' => $newCursor,
            ]);
          } else {
            $visitedPostsCl->updateOne(
              ['post_id' => $postId],
              ['$set' => ['cursor' => $newCursor]]
            );
          }
          $isFirstStep = false;
        }
      }

      if ($newCursor === $cursor) {
        break;
      } else {
        $cursor = $newCursor;
      }
    } while (true);
  }
} catch (\Exception $e) {
  $logger->error($e->getMessage());
  exit(1);
}
