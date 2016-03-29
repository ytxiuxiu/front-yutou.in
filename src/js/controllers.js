/**
* app.controller Module
*
* Description
*/
var GOOGLE_LOGIN_API_GLIENT_ID = '302391598041-f0rue0f55c2lvi8vhpbgakpgm8t2k8ug.apps.googleusercontent.com';

angular.module('app.controllers', [])
  .controller('AppController', ['$scope', '$localStorage', 'AppService', function($scope, $localStorage, appService) {
    $scope.auth = {
      user: {},
      logout: function() {
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function() {
          $scope.auth.user = {};
          $scope.$storage.auth = null;
          $scope.$apply();
        });
      }
    };
    $scope.$storage = $localStorage;

    // auth
    if ($scope.$storage.auth && $scope.$storage.auth.idToken) {
      // if idToken in local storage
      appService.auth($scope.$storage.auth.idToken).then(function(response) {
        $scope.auth.user = response.data.user;
      });
    }

    // init login button
    gapi.load('auth2', function() {
      auth2 = gapi.auth2.init({
        client_id: GOOGLE_LOGIN_API_GLIENT_ID,
        cookiepolicy: 'single_host_origin',
        scope: 'email profile'
      });
      auth2.attachClickHandler(document.getElementById('btn-login'), {},
        function(googleUser) {
          var idToken = googleUser.getAuthResponse().id_token;
          // auth
          appService.auth(idToken).then(function(response) {
            $scope.auth.user = response.data.user;
            // store idToken in local storage
            $scope.$storage.auth = {
              idToken: idToken
            };
          });
        }, function(error) {
          alert(JSON.stringify(error, undefined, 2));
        });
    });
  }])
  .controller('HomeController', ['$scope', function($scope) {

    
  }])
  .controller('LinksController', ['$scope', '$stateParams', 'LinksService', 
    function($scope, $stateParams, linksService) {
    $scope.links = {
      categories: null,
      category: null,
      links: null
    };

    // get all categories
    linksService.getAllCategories().then(function(response) {
      $scope.links.categories = response.data.categories;

      // find out current category
      if ($stateParams.category) {
        for (var i = 0; i < $scope.links.categories.length; i++) {
          if ($scope.links.categories[i].link == $stateParams.category) {
            $scope.links.category = $scope.links.categories[i];
          }
        }
      } else {
        $scope.links.category = $scope.links.categories[0];
      }

      // get links of current category
      linksService.getLinks($scope.links.category.link).then(function(response) {
        $scope.links.links = response.data.links;
      });
    });
    
    
  }])
  .controller('KnowledgeController', ['$scope', '$state', '$stateParams', 'AppService', 'KnowledgeService',
    function($scope, $state, $stateParams, appService, knowledgeService) {

    $scope.knowledge = {
      map: null,
      history: [],
      drop: function(event, parent, list, index) {
        var node = list[index];
        node.editionId = appService.uuid();
        node.path = parent.path + '/' + node.node.nodeId;
        node.dirty = true;
        $scope.knowledge.history.push({
          type: 'update',
          node: node
        });
      },
      found: null,
      findNodeInNode: function(inNode, nodeId) {
        if (inNode.node.nodeId === nodeId) {
          $scope.knowledge.found = inNode;
        } else {
          for (var i = 0, l = inNode.children.length; i < l; i++) {
            $scope.knowledge.findNodeInNode(inNode.children[i], nodeId);
          }
        }
      },
      contextMenu: [
        ['Show after', function($itemScope) {
          $state.go('knowledge', { nodeId: $itemScope.child.node.nodeId });
        }],
        null,
        ['Add child', function($itemScope) {
          var list = $itemScope.child.children;
          var nodeId = appService.uuid();
          list.push({
            node: {
              nodeId: nodeId
            },
            editionId: appService.uuid(),
            name: null,
            path: $itemScope.child.path + '/' + nodeId,
            small: null,
            content: null,
            children: [],
            dirty: true
          });
          $scope.knowledge.history.push({
            type: 'add',
            node: list[list.length - 1]
          });
        }],
        ['Remove', function($itemScope) {
          var node = $itemScope.list[$itemScope.$index];
          node.editionId = appService.uuid();
          node.deleted = true;
          $scope.knowledge.history.push({
            type: 'remove',
            node: node
          });
          $itemScope.list.splice($itemScope.$index, 1);
        }]
      ],
      change: function(node) {
        node.editionId = appService.uuid();
        node.dirty = true;
        $scope.knowledge.history.push({
          type: 'update',
          node: node
        });
      },
      save: function() {
        var history = $scope.knowledge.history;
        var saveList = [];
        (function() {
          for (var i = history.length - 1; i >= 0; i--) {
            var add = true;
            for (var j = 0, lj = saveList.length; j < lj; j++) {
              // do not add same type changing of a same node
              if (saveList[j].node.node.nodeId === history[i].node.node.nodeId) {
                if (saveList[j].type === history[i].type) {
                  add = false;  // no same type
                }
                // do not add update after add of a same node
                else if (saveList[j].type === 'update' && history[i].type === 'add') {
                  saveList.splice(j, 1);  // no update
                  break;
                }
                // do not handle remove after add of a same node
                else if (saveList[j].type === 'remove' && history[i].type === 'add') {
                  saveList.splice(j, 1);  // no add
                  add = false;  // no remove
                  break;
                }
              }
            }
            if (add) {
              saveList.push(history[i]);
            }
          }
        })();
        
        saveList.reverse();
        
        (function() {
          for (var i = 0, li = saveList.length; i < li; i++) {
            knowledgeService.addEdition(saveList[i]).then(function(response) {
              var edition = response.data.node;
              var nodeId = edition.node.nodeId;
              if (edition.deleted) {

              } else {
                $scope.knowledge.findNodeInNode($scope.knowledge.map, nodeId);
                $scope.knowledge.found.dirty = false;
              }
            });
          }
        })();
        history.splice(0, history.length);
        saveList.splice(0, saveList.length);
      }
    };


    // get map
    var nodeId = $stateParams.nodeId ? $stateParams.nodeId : 'root';
    knowledgeService.getMap(nodeId).then(function(response) {
      $scope.knowledge.map = response.data.map;
    });

    $scope.onDragstart = function(list, event) {
       list.dragging = true;
       if (event.dataTransfer.setDragImage) {
         var img = new Image();
         img.src = 'images/node.png';
         event.dataTransfer.setDragImage(img, 0, 0);
       }
    };
  }]);









