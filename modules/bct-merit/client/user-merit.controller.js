var ctrl = ['Session', 'statsData', function(Session, statsData) {
    var ctrl = this;
    this.user = statsData.user;
    this.statistics = statsData.stats;

    if (Session.user) {
      this.viewingSelf = Session.user.id === this.user.id;
    }
  }
];

module.exports = angular.module('bct.merit.ctrl', [])
.controller('UserMeritCtrl', ctrl)
.name;
