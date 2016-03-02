/**
* app.controller Module
*
* Description
*/
angular.module('app.controllers', [])
  .controller('HomeController', ['$scope', function($scope) {

    
  }])
  .controller('LinksController', ['$scope', '$stateParams', 'LinksService', function($scope, $stateParams, linksService) {
    $scope.links = {
      categories: null,
      category: null,
      links: null,
    };

    // get all categories
    linksService.getAllCategories().then(function(response) {
      $scope.links.categories = response.data.categories;

      // find out current category
      if ($stateParams.category) {
        for (var i = 0; i < $scope.links.categories.length; i++) {
          if ($scope.links.categories[i].link == $stateParams.category) {
            $scope.links.category = $scope.links.categories[i];
          }
        }
      } else {
        $scope.links.category = $scope.links.categories[0];
      }

      // get links of current category
      linksService.getLinks($scope.links.category.link).then(function(response) {
        $scope.links.links = response.data.links;
      });
    });
    
    
  }]);