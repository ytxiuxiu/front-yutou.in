/**
* app.services Module
*
* Description
*/
var API_PREFIX = 'api/';
var API_SUFFIX = '';

angular.module('app.services', [])
  .factory('AppService', ['$http', function($http) {
    return {
      auth: function(idToken) {
        return $http.post(API_PREFIX + 'auth', {
          idToken: idToken
        });
      }
    };
  }])
  .factory('LinksService', ['$http', function($http) {
    return {
      getAllCategories: function() {
        return $http.get(API_PREFIX + 'links/all-categories' + '.json');
      },
      getLinks: function(category) {
        return $http.get(API_PREFIX + 'links/' + category + '.json');
      }
    };
  }])
  .factory('KnowledgeService', ['$http', function($http) {
    return {
      getAllCategories: function() {
        return $http.get(API_PREFIX + 'knowledge/all-categories' + '.json');
      },
      getMap: function(category) {
        return $http.get(API_PREFIX + 'knowledge/map/' + category + '.json');
      }
    };
  }]);