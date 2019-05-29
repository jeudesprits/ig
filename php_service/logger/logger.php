<?php

class Logger
{
  private function tgLog($message, $isError)
  {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.telegram.org/bot' . $_ENV['TG_TOKEN'] . '/sendMessage');
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
      'Content-Type: application/json; charset=utf-8',
    ]);

    $json_array = [
      'parse_mode' => 'Markdown',
      'disable_notification' => 'true',
      'chat_id' => $_ENV['TG_CHANNEL_NAME'],
      'text' => '``` ' . ($isError ? 'error' : 'info') . ' [PHP 👿🤒😾🙀😑]: ' . $message . ' ```'
    ];
    $body = json_encode($json_array);

    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);

    $response = curl_exec($ch);

    if (!$response) {
      die('Error: "' . curl_error($ch) . '" - Code: ' . curl_errno($ch));
    }

    curl_close($ch);
  }

  private function fileLog($message, $isError)
  {
    $formattedMessage =  date('Y-m-d H:i:s') . ' ' . ($isError ? 'error' : 'info') . ' [PHP 👿🤒😾🙀😑]: ' . $message . "\n";

    if ($isError) {
      $errorLogs = fopen(__DIR__ . "/../../logs/error.log", "a") or die("Unable to open file!");
      fwrite($errorLogs, $formattedMessage);
      fclose($errorLogs);
    }

    $combinedLogs = fopen(__DIR__ . "/../../logs/combined.log", "a") or die("Unable to open file!");
    fwrite($combinedLogs, $formattedMessage);
    fclose($combinedLogs);
  }

  function info($message)
  {
    $this->tgLog($message, false);
    $this->fileLog($message, false);
  }

  function error($message)
  {
    $this->tgLog($message, true);
    $this->fileLog($message, true);
  }
}
