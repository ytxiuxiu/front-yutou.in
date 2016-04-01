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
  .directive('powerControl', function() {
    return {
      transclude: true,
      link: function($scope, element, attributes) {
        if (attributes.pcRequires === 'h') {
          
        }
      }
    };
  });