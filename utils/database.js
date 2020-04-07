const config = require('config');

const mongoDB = () =>
  process.env.NODE_ENV !== 'production'
    ? 'mongodb://localhost:27017/portfolio-api'
    : config.get('mongoProdDb');

const mysqlDB = () => console.log('sql database...');

exports.mongoDB = mongoDB;
exports.sql_DB = mysqlDB;
