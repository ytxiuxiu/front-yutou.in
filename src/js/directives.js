/**
* app.directivrs Module
*
* Description
*/
angular.module('app.directives', [])
  .directive('socialLinks', function() {
    return {
      templateUrl: 'templates/home/social-links.tpl.html',
    };
  })
  .directive('powerControl', ['AppService', function(appService) {
    function userChange($scope, element, attributes, user) {
      if (!user.group) {
        if (!$scope.auth.noLoginUser) {
          appService.getNoLoginUser().then(function(response) {
            $scope.auth.noLoginUser = response.data.user;
            if (!$scope.auth.user.group) {
              ckeck($scope, element, attributes, $scope.auth.noLoginUser);
            }
          });
        } else {
          if (!$scope.auth.user.group) {
            ckeck($scope, element, attributes, $scope.auth.noLoginUser);
          }
        }
      } else {
        ckeck($scope, element, attributes, $scope.auth.user);
      }
    }

    function ckeck($scope, element, attributes, user) {
      if (user.group.name === 'root') {
        element.show();
        return;
      }
      var actions = user.group.actions;
      for (var i = 0, l = actions.length; i < l; i++) {
        if (actions[i].name === attributes.powerControl) {
          element.show();
          return;
        }
      }
      element.hide();
    }

    return {
      link: function($scope, element, attributes) {
        userChange($scope, element, attributes, $scope.auth.user);
        $scope.$on('auth.user.change', function(event, user) {
          userChange($scope, element, attributes, user);
        });
      }
    };
  }]);