/**
* app Module
*
* Description
*/
angular.module('app', [
    'ngSanitize',
    'ui.bootstrap', 
    'ui.router', 
    'app.controllers',
    'app.directives',
    'app.services',
    'app.filters',
    'dndLists',
    'puElasticInput',
    'googleplus'
  ])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('home', {
      url: '',
      templateUrl: 'templates/home/home.tpl.html',
      controller: 'HomeController'
    })
    .state('links', {
      url: '/links/{category}',
      templateUrl: 'templates/links/links.tpl.html',
      controller: 'LinksController'
    })
    .state('knowledge', {
      url: '/knowledge/{category}',
      templateUrl: 'templates/knowledge/map.tpl.html',
      controller: 'KnowledgeController'
    });
  }])
  .config(['GooglePlusProvider', function(GooglePlusProvider) {
     GooglePlusProvider.init({
        clientId: '302391598041-f0rue0f55c2lvi8vhpbgakpgm8t2k8ug.apps.googleusercontent.com'
     });
  }]);