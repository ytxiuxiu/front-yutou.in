/**
* yutouApp Module
*
* Description
*/
angular.module('app', [
    'ui.bootstrap', 
    'ui.router', 
    'app.controllers',
    'app.directives'
  ])
  .config(['$stateProvider', '$urlRouterProvider' ,function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('home', {
      url: '',
      templateUrl: 'templates/home/home.tpl.html',
      controller: 'HomeController',
    })
    .state('links', {
      url: '/links',
      templateUrl: 'templates/links/links.tpl.html',
      controller: 'LinksController',
    });
  }]);