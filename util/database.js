const Sequelize = require('sequelize');
const { user, host, password, database } = require('../db-config');

const sequelize = new Sequelize(database, user, password, {
  dialect: 'mysql',
  host: host,
});

module.exports = sequelize;
