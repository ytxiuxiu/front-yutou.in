angular.module('app.controllers')
  .controller('ProjectController', ['$scope', '$state', '$stateParams', '$document', '$localStorage', '$interval', 'AppService',
    function($scope, $state, $stateParams, $document, $localStorage, $interval, appService) {

    $scope.navbar.current = 'projects';
    $scope.changeTitle('Projects');

    $scope.projects = {
      list: [{
        currentImage: 0,
        images: ['images/projects/1.png', 'images/projects/2.png'],
        name: 'Love books',
        description: ''
      }]
    };

    var changeImage = function() {
      for (var i = 0, l = $scope.projects.list.length; i < l; i++) {
        $scope.projects.list[i].currentImage = 
          $scope.projects.list[i].currentImage + 1 > $scope.projects.list[i].images.length - 1 ? 
          0 : 
          $scope.projects.list[i].currentImage + 1;
      }
    };
    $interval(changeImage, 5000);

  }]);