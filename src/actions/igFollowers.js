import axios from 'axios';
import db from '../db';
import { logger, __line } from '../utils';

async function getCurrentIGFollowersCount(igName) {
  let count;

  try {
    const { data } = await axios.get(
      `https://www.instagram.com/${igName}/?__a=1`
    );

    // eslint-disable-next-line prefer-destructuring
    count = data.graphql.user.edge_followed_by.count;
  } catch (error) {
    logger.error(`${error.message} (${__line(error)} ${__filename})`);
  }

  return count;
}

async function postCurrentIGFollowersCount(igName, count) {
  try {
    await db.connect();
    const cl = await db.getCollection(`ig_${igName}`, 'followers_count');
    await cl.insertOne({
      count,
      created_at: new Date(),
    });
  } catch (error) {
    logger.error(`${error.message} (${__line(error)} ${__filename})`);
  }
}

async function getListOfIGFollowersCounts(igName) {
  let list;

  try {
    await db.connect();
    const cl = await db.getCollection(`ig_${igName}`, 'followers_count');
    list = await cl
      .find({})
      .project({ _id: 0 })
      .toArray();
  } catch (error) {
    logger.error(`${error.message} (${__line(error)} ${__filename})`);
  }

  return list;
}

export default {
  getCurrentIGFollowersCount,
  postCurrentIGFollowersCount,
  getListOfIGFollowersCounts,
};
