<?php
set_time_limit(0);
date_default_timezone_set('UTC');

require __DIR__ . '/vendor/autoload.php';

// Get list of profiles
$profilesJson = file_get_contents(__DIR__ . '/../profiles.json');
$profiles = json_decode($hashtagsJson, true);

// Load IG client
$ig = new \InstagramAPI\Instagram();

// Trying IG login
try {
  $ig->login('jeudesprits', 'rj2119942104sl');
} catch (\Exception $e) {
  echo $e->getMessage();
  exit(1);
}

// Trying get comments
try {
  $userId = $ig->people->getUserIdForName('loganpaul');
  $posts =  $ig->timeline->getUserFeed($userId)->getItems();
  foreach($posts as $post) {
    $postId = $post->getId();
    echo $postId . "\n\n";

    $prevMinId = NULL;
    do {
      $mediaCommentsResponse;
      if($prevMinId === NULL) {
        $mediaCommentsResponse = $ig->media->getComments($postId);
      } else {
        $mediaCommentsResponse = $ig->media->getComments($postId, ["min_id" => $prevMinId]);
      }

      $minId = $mediaCommentsResponse->getNextMinId();
      
      if($minId !== NULL && $prevMinId === $minId) { 
        break; 
      }
      $prevMinId = $minId;

      $comments = $mediaCommentsResponse->getComments();
      foreach($comments as $comment) {
        $commentUserId = $comment->getUserId();

        $friendshipsShowResponse = $ig->people->getFriendship($commentUserId);
        $isFollowing = $friendshipsShowResponse->getFollowing();

        if($isFollowing) { 
          continue; 
        }

        $friendshipResponse = $ig->people->follow($commentUserId);
        echo $friendshipResponse->getStatus() . "\n";
        
        sleep(5);
      }
    } while($prevMinId !== NULL);

    echo "\n";
  }
  //$minid = '{"cached_comments_cursor": "17856526684406117", "bifilter_token": "KGIBFACQAEAAKAAgABgAGAAQAAgACAAIAOar6_99-1yf6-vX3_tvQ873-KxBt8iRL3-PeDo1MIldxYjDCO"}';
  // next
  //$comments = $ig->media->getComments($postId, ["min_id" => $minid]);

  // prev
  //$comments = $ig->media->getComments($postId, ["max_id" => $minid]);
  

  //Encode the array into a JSON string.
  //$encodedString = json_encode($comments);
  //Save the JSON string to a text file.
  //file_put_contents('response.json', $encodedString);
} catch (\Exception $e) {
  echo $e->getMessage();
  exit(1);
}