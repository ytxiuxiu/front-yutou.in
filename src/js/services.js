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
      login: function(idToken) {
        return $http.post(API_PREFIX + 'auth/login', {
          idToken: idToken
        });
      },
      auth: function(loginToken) {
        return $http.post(API_PREFIX + 'auth', {
          loginToken: loginToken
        });
      },
      log: function(log) {
        return $http.post(API_PREFIX + 'site/log', log);
      },
      getNoLoginUser: function() {
        return $http.get(API_PREFIX + 'auth/no-login-user');
      },
      getSiteStatus: function() {
        return $http.get(API_PREFIX + 'site/status');
      },
      uuid: function() {
        return rfc4122.v4().split('-').join('');
      },
      getLoginToken: function() {
        return $localStorage.auth && $localStorage.auth.loginToken ? $localStorage.auth.loginToken : 'no-login';
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
        return $http.get(API_PREFIX + 'knowledge/map/' + path + '?loginToken=' + appService.getLoginToken());
      },
      getNode: function(nodeId) {
        return $http.get(API_PREFIX + 'knowledge/node/' + nodeId + '?loginToken=' + appService.getLoginToken());
      },
      addEdition: function(saveItem) {
        var data = saveItem.node;
        return $http.post(API_PREFIX + 'knowledge/map/edition/add', {
          loginToken: appService.getLoginToken(),
          editionId: data.editionId,
          nodeId: data.node.nodeId,
          nodeType: data.node.nodeType,
          name: data.name,
          path: data.path,
          brotherNodeId: data.brotherNodeId,
          small: data.small,
          content: data.content,
          status: data.status,
          priority: data.priority,
          deleted: data.deleted
        });
      },
      dictFind: function(keyword) {
        return $http.get(API_PREFIX + '/knowledge/dict/' + keyword + '?loginToken=' + appService.getLoginToken());
      },
      findHistory: function(wordId) {
        return $http.get(API_PREFIX + '/knowledge/dict/finding-history?wordId=' + wordId + '&loginToken=' + appService.getLoginToken());
      }
    };
  }]);




