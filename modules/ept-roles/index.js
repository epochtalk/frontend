var path = require('path');
var db = require(path.normalize(__dirname + '/db'));
var routes = require(path.normalize(__dirname + '/routes'));
var permissions = require(path.normalize(__dirname + '/permissions'));
var authorization = require(path.normalize(__dirname + '/authorization'));
var plugins = require(path.normalize(__dirname + '/plugins'));

module.exports =  {
  name: 'roles',
  permissions: permissions,
  routes: routes,
  authorization: authorization,
  db: db,
  plugins: plugins
};
