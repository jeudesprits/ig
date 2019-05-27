import axios from 'axios';
import db from '../db';
import { logger } from '../util';

async function getCurrentIGFollowersCount(igName) {
  let response;
  let count;

  try {
    response = await axios.get(`https://www.instagram.com/${igName}/?__a=1`);

    // eslint-disable-next-line prefer-destructuring
    count = response.data.graphql.user.edge_followed_by.count;
  } catch (error) {
    logger.error(error.message, () => process.exit(1));
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
    logger.error(error.message, () => process.exit(1));
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
    logger.error(error.message, () => process.exit(1));
  }

  return list;
}

export default {
  getCurrentIGFollowersCount,
  postCurrentIGFollowersCount,
  getListOfIGFollowersCounts,
};
