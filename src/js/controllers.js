/**
* app.controller Module
*
* Description
*/
angular.module('app.controllers', [])
  .controller('AppController', ['$scope', 'GooglePlus', function($scope, GooglePlus) {
    $scope.auth = {
      user: {},
      logout: function() {
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function() {
          $scope.user = {};
          $scope.$apply();
        });
      },
      login: function(googleUser) {
        var profile = googleUser.getBasicProfile();
        var auth = $scope.auth;
        auth.user.name = profile.getName();
        auth.user.familyName = profile.getFamilyName();
        auth.user.givenName = profile.getGivenName();
        auth.user.email = profile.getEmail();
        auth.user.image = profile.getImageUrl();
        auth.user.idToken = googleUser.getAuthResponse().id_token;
        $scope.$apply();
      }
    };

    gapi.load('auth2', function() {
      auth2 = gapi.auth2.init({
        client_id: '302391598041-f0rue0f55c2lvi8vhpbgakpgm8t2k8ug.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin',
        scope: 'email profile'
      });
      auth2.attachClickHandler(document.getElementById('btn-login'), {},
        function(googleUser) {
          $scope.auth.login(googleUser);
        }, function(error) {
          alert(JSON.stringify(error, undefined, 2));
        });
    });
  }])
  .controller('HomeController', ['$scope', function($scope) {

    
  }])
  .controller('LinksController', ['$scope', '$stateParams', 'LinksService', 
    function($scope, $stateParams, linksService) {
    $scope.links = {
      categories: null,
      category: null,
      links: null
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
    
    
  }])
  .controller('KnowledgeController', ['$scope', '$stateParams', 'KnowledgeService', 
    function($scope, $stateParams, knowledgeService) {

    $scope.knowledge = {
      categories: null,
      category: null,
      map: null,
      newNode: [{
        name: 'New Node',
        children: []
      }],
    };

    // get all categories
    knowledgeService.getAllCategories().then(function(response) {
      $scope.knowledge.categories = response.data.categories;

      // find out current category
      if ($stateParams.category) {
        for (var i = 0; i < $scope.knowledge.categories.length; i++) {
          if ($scope.knowledge.categories[i].link == $stateParams.category) {
            $scope.knowledge.category = $scope.knowledge.categories[i];
          }
        }
      } else {
        $scope.knowledge.category = $scope.knowledge.categories[0];
      }

      // get map of current category
      knowledgeService.getMap($scope.knowledge.category.link).then(function(response) {
        $scope.knowledge.map = response.data.map;
      });
    });

    $scope.onDragstart = function(list, event) {
       list.dragging = true;
       if (event.dataTransfer.setDragImage) {
         var img = new Image();
         img.src = 'images/node.png';
         event.dataTransfer.setDragImage(img, 0, 0);
       }
    };
  }]);









