/**
* app Module
*
* Description
*/
angular.module('app', [
    'ui.bootstrap', 
    'ui.router', 
    'app.controllers',
    'app.directives',
    'app.services'
  ])
  .config(['$stateProvider', '$urlRouterProvider' ,function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('home', {
      url: '',
      templateUrl: 'templates/home/home.tpl.html',
      controller: 'HomeController',
    })
    .state('links', {
      url: '/links/{category}',
      templateUrl: 'templates/links/links.tpl.html',
      controller: 'LinksController',
    });
  }]);