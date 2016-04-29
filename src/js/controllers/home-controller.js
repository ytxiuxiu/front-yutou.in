angular.module('app.controllers')
  .controller('HomeController', ['$scope', function($scope) {

    $scope.navbar.current = 'home';
  }]);