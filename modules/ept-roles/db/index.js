var path = require('path');

module.exports = {
  create: require(path.normalize(__dirname + '/create')),
  all: require(path.normalize(__dirname + '/all')),
  update: require(path.normalize(__dirname + '/update'))
};