import { MongoClient } from 'mongodb';
import { secrets } from '../util';

class DB {
  constructor() {
    this.connection = null;
  }

  async connect() {
    if (!this.connection) {
      this.connection = await MongoClient.connect(secrets.MONGO_URI, {
        useNewUrlParser: true,
      });
    }

    return this.connection;
  }

  async close() {
    await this.connection.close();
  }

  async getCollection(dbName, clName) {
    return new Promise((resolve, reject) => {
      this.connection.db(dbName).collection(clName, (error, collection) => {
        if (error) {
          reject(error.message);
        }
        resolve(collection);
      });
    });
  }
}

export default new DB();
