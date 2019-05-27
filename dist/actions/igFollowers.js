"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _db = _interopRequireDefault(require("../db"));

var _util = require("../util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function getCurrentIGFollowersCount(igName) {
  let response;
  let count;

  try {
    response = await _axios.default.get(`https://www.instagram.com/${igName}/?__a=1`); // eslint-disable-next-line prefer-destructuring

    count = response.data.graphql.user.edge_followed_by.count;
  } catch (error) {
    _util.logger.error(error.message, () => process.exit(1));
  }

  return count;
}

async function postCurrentIGFollowersCount(igName, count) {
  try {
    await _db.default.connect();
    const cl = await _db.default.getCollection(`ig_${igName}`, 'followers_count');
    await cl.insertOne({
      count,
      created_at: new Date()
    });
  } catch (error) {
    _util.logger.error(error.message, () => process.exit(1));
  }
}

async function getListOfIGFollowersCounts(igName) {
  let list;

  try {
    await _db.default.connect();
    const cl = await _db.default.getCollection(`ig_${igName}`, 'followers_count');
    list = await cl.find({}).project({
      _id: 0
    }).toArray();
  } catch (error) {
    _util.logger.error(error.message, () => process.exit(1));
  }

  return list;
}

var _default = {
  getCurrentIGFollowersCount,
  postCurrentIGFollowersCount,
  getListOfIGFollowersCounts
};
exports.default = _default;