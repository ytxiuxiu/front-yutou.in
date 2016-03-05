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
  });