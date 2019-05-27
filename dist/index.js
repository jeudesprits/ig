"use strict";

var _util = require("./util");

var _actions = require("./actions");

(async () => {
  const info = await _actions.tiktokVideos.getTikTokVideoInfo();
  await _actions.tiktokVideos.downloadTikTokVideo(info);
})();