const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const dbConfig = require('../db-config');

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(dbConfig)
    .then(client => {
      console.log('--- connected to mongo client ---');
      _db = client.db();
      callback();
    })
    .catch(err => {
      console.log('err', err);
      throw err;
    });
}

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No database found';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
