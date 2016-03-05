/**
* app.services Module
*
* Description
*/
angular.module('app.services', [])
  .factory('LinksService', ['$http', function($http) {
    return {
      getAllCategories: function() {
        return $http.get('api/links/all-categories' + '.json');
      },
      getLinks: function(category) {
        return $http.get('api/links/' + category + '.json');
      }
    };
  }])
  .factory('KnowledgeService', ['$http', function($http) {
    return {
      getAllCategories: function() {
        return $http.get('api/knowledge/all-categories' + '.json');
      },
      getMap: function(category) {
        return $http.get('api/knowledge/map/' + category + '.json');
      }
    };
  }]);