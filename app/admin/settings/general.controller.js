module.exports = ['$scope', 'settings', function($scope, settings) {
  this.parent = $scope.$parent;
  this.parent.tab = 'general';
  this.localImageServer = settings.images.storage === 'local';
  this.settings = settings;

  this.showAccessKey = false;
  this.showSecretKey = false;
  this.showSmtpPass = false;
}];
