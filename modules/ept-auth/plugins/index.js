var path = require('path');

module.exports = [
  {
    register: require(path.normalize(__dirname + '/authorization')),
    methods: true
  }
];
