/**
* app.services Module
*
* Description
*/
var API_PREFIX = 'api/';
var API_SUFFIX = '';

angular.module('app.services', ['uuid'])
  .factory('AppService', ['$http', 'rfc4122', '$localStorage', function($http, rfc4122, $localStorage) {
    return {
      auth: function(idToken) {
        return $http.post(API_PREFIX + 'auth', {
          idToken: idToken
        });
      },
      uuid: function() {
        return rfc4122.v4().split('-').join('');
      },
      getIdToken: function() {
        return $localStorage.auth ? $localStorage.auth.idToken : 'no-login';
      },
      objToParams: function(obj) {
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
  .factory('KnowledgeService', ['$http', 'rfc4122', 'AppService', function($http, rfc4122, appService) {
    return {
      getMap: function(path) {
        return $http.get(API_PREFIX + 'knowledge/map/' + path + '?idToken=' + appService.getIdToken());
      },
      addEdition: function(saveItem) {
        var data = saveItem.node;
        return $http.post(API_PREFIX + 'knowledge/map/edition/add', {
          idToken: appService.getIdToken(),
          editionId: data.editionId,
          nodeId: data.node.nodeId,
          name: data.name,
          path: data.path,
          small: data.small,
          content: data.content,
          deleted: data.deleted
        });
      }
    };
  }]);




