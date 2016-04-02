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
    'ngStorage',
    'typer',
    'ui.bootstrap.contextMenu',
    'uuid',
    'ui.layout',
    'ngAnimate',
    'toastr',
    'angular-loading-bar'
  ])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'templates/home/home.tpl.html',
      controller: 'HomeController'
    })
    .state('same-as-home', {
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
      url: '/knowledge/{nodeId}',
      templateUrl: 'templates/knowledge/map.tpl.html',
      controller: 'KnowledgeController'
    });
  }])
  .config(['$httpProvider',function($httpProvider) {
    $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

    $httpProvider.defaults.transformRequest = [function(data) {
      var param = function(obj) {
        var query = '';
        var name, value, fullSubName, subName, subValue, innerObj, i;
        for (name in obj) {
          value = obj[name];
          if (value instanceof Array) {
            for (i = 0; i < value.length; ++i) {
              subValue = value[i];
              fullSubName = name + '[' + i + ']';
              innerObj = {};
              innerObj[fullSubName] = subValue;
              query += param(innerObj) + '&';
            }
          } else if (value instanceof Object) {
            for (subName in value) {
              subValue = value[subName];
              fullSubName = name + '[' + subName + ']';
              innerObj = {};
              innerObj[fullSubName] = subValue;
              query += param(innerObj) + '&';
            }
          } else if (value !== undefined && value !== null) {
            query += encodeURIComponent(name) + '='
              + encodeURIComponent(value) + '&';
          }
        }
        return query.length ? query.substr(0, query.length - 1) : query;
      };
      return angular.isObject(data) && String(data) !== '[object File]'
        ? param(data)
        : data;
    }];
  }]);

angular.module('app.controllers', []);