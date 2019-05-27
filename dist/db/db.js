"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongodb = require("mongodb");

var _util = require("../util");

class DB {
  constructor() {
    this.connection = null;
  }

  async connect() {
    if (!this.connection) {
      this.connection = await _mongodb.MongoClient.connect(_util.secrets.MONGO_URI, {
        useNewUrlParser: true
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

var _default = new DB();

exports.default = _default;