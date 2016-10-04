angular.module('app.controllers')
  .controller('KnowledgeNewNodeController', ['$scope', '$state', '$stateParams', '$sce', '$document', 'AppService', 'KnowledgeService',
    function($scope, $state, $stateParams, $sce, $document, appService, knowledgeService) {

    $scope.navbar.current = 'knowledge';
    $scope.changeTitle('Knowledge Map');

    $scope.editorParams = {};

    angular.extend($scope.editorParams, {
      element: document.getElementById('node-content-editor')
    }, common.editor);

    $scope.node = {
      node: null,
      edit: 'off',
      load: function() {
        knowledgeService.getNode($stateParams.nodeId).then(function(response) {
          $scope.node.node = response.data.node;
          $scope.changeTitle($scope.node.node.currentEdition.name + ' - Knowledge');
          $scope.node.contentEditor.value($scope.node.node.currentEdition.content ? $scope.node.node.currentEdition.content : '');
        });
      },
      contentEditor: new SimpleMDE($scope.editorParams),
      save: function() {
        $scope.node.node.currentEdition.editionId = appService.uuid();
        $scope.node.node.node = $scope.node.node.currentEdition;
        knowledgeService.addEdition($scope.node.node).then(function(response) {
          $scope.node.load();
        });

      }
    };

    $scope.node.load();

    $scope.node.contentEditor.codemirror.on('change', function() {
      var node = $scope.node.node.currentEdition;
      $scope.safeApply(function() {
        node.editionId = appService.uuid();
        node.content = $scope.node.contentEditor.value();
        node.dirty = true;
      });
    });

    
    angular.extend($scope.editorParams, {
      element: document.getElementById('node-content-editor')
    }, common.editor);

    $scope.knowledge = {
      map: null,
      mode: 'normal',
      nodeId: $stateParams.nodeId ? $stateParams.nodeId : 'root',
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
      load: function() {
        var wait = setInterval(function() {
          if ($scope.node.node !== null) {
            var path = $scope.node.node.currentEdition.path;
            var nodeId = path.substring(0, path.lastIndexOf('/'));
            nodeId = nodeId.substring(nodeId.lastIndexOf('/') + 1);
            $scope.safeApply(function() {
              knowledgeService.getMap(nodeId).then(function(response) {
                $scope.knowledge.map = response.data.map;
                $scope.changeTitle($scope.knowledge.map.name + ' - Knowledge Map');

                // highlight current node
                var waitNode = setInterval(function() {
                  $node = $('#node-' + $scope.node.node.nodeId);
                  if ($node.get(0) !== null) {
                    $node.find('.node-box').css('background-color', '#dddddd');
                    clearInterval(waitNode);
                  }
                }, 100);
                
              });
            });
            clearInterval(wait);
          }
        }, 100);
        
      },
      found: null,
      foundParent: null,
      find: function(nodeId, inNode) {
        for (var j = 0, lj = inNode.children.length; j < lj; j++) {
          if (inNode.children[j].node.nodeId == nodeId) {
            $scope.knowledge.found = inNode.children[j];
            $scope.knowledge.foundParent = inNode;
            return;
          } else {
            for (var i = 0, l = inNode.children[j].children.length; i < l; i++) {
              $scope.knowledge.find(nodeId, inNode.children[j].children[i]);
            }
          }
        }
      },
      popover: 'templates/knowledge/popover.tpl.html',
      open: function() {
        $state.go('knowledge-node', { nodeId: $scope.knowledge.currentEditing.node.nodeId });
      },
      showAfter: function(nodeId) {
        // TODO: improve spliter

        nodeId = nodeId ? nodeId : $scope.knowledge.currentEditing.node.nodeId;

        $state.go('knowledge', {nodeId: nodeId});

        // var found;
        // function find(nodeId, inNode) {
        //   if (inNode.node.nodeId == nodeId) {
        //     found = inNode;
        //   } else {
        //     for (var i = 0, l = inNode.children.length; i < l; i++) {
        //       find(nodeId, inNode.children[i]);
        //     }
        //   }
        // }
        // find(nodeId, $scope.knowledge.map);
        // console.log(found);

        // knowledgeService.getMap(found.children[0].node.nodeId).then(function(response) {
        //   console.log(response.data.map);
        // });

      },
      contextMenu: [
        ['Open', function($itemScope) {
          $state.go('knowledge-node', { nodeId: $itemScope.child.node.nodeId });
        }],
        ['Show after', function($itemScope) {
          $scope.knowledge.showAfter($itemScope.child.node.nodeId);
        }],
        [function($itemScope) {
          return $scope.knowledge.mode === 'normal' ? 'Show content' : 'Edit content';
        }, function($itemScope) {
          $scope.knowledge.showContent($itemScope.child);
        }, function($itemScope) {
          if ($scope.knowledge.mode === 'normal' && !$itemScope.child.content || $itemScope.child.content === '') {
            return false;
          }
        }],
        null,
        ['Mark as Read', function($itemScope) {
          var nodeId = $itemScope.child.node.nodeId;
          if (!$scope.$storage.readList) {
            $scope.$storage.readList = {};
          }
          $scope.$storage.readList[nodeId] = 'read';
        }, function($itemScope) {
          if ($scope.$storage.readList) {
            return $scope.$storage.readList[$itemScope.child.node.nodeId] !== true && 
              $scope.$storage.readList[$itemScope.child.node.nodeId] !== 'read';
          } else {
            return true;
          }
        }],
        ['Mark as Unread', function($itemScope) {
          var nodeId = $itemScope.child.node.nodeId;
          if (!$scope.$storage.readList) {
            $scope.$storage.readList = {};
          }
          $scope.$storage.readList[nodeId] = 'unread';
        }, function($itemScope) {
          if ($scope.$storage.readList) {
            console.log($scope.$storage.readList[$itemScope.child.node.nodeId]);
            return $scope.$storage.readList[$itemScope.child.node.nodeId] !== undefined &&
              $scope.$storage.readList[$itemScope.child.node.nodeId] !== 'unread';
          } else {
            return false;
          }
        }],
        ['Mark as Read Later', function($itemScope) {
          var nodeId = $itemScope.child.node.nodeId;
          if (!$scope.$storage.readList) {
            $scope.$storage.readList = {};
          }
          $scope.$storage.readList[nodeId] = 'read-later';
        }, function($itemScope) {
          if ($scope.$storage.readList) {
            return $scope.$storage.readList[$itemScope.child.node.nodeId] !== 'read-later';
          } else {
            return true;
          }
        }],
        ['Mark as Reread', function($itemScope) {
          var nodeId = $itemScope.child.node.nodeId;
          if (!$scope.$storage.readList) {
            $scope.$storage.readList = {};
          }
          $scope.$storage.readList[nodeId] = 'reread';
        }, function($itemScope) {
          if ($scope.$storage.readList) {
            return $scope.$storage.readList[$itemScope.child.node.nodeId] !== 'reread';
          } else {
            return true;
          }
        }],
        null,
        ['Add child', function($itemScope) {
          var list = $itemScope.child.children;
          var nodeId = appService.uuid();
          list.push({
            node: {
              nodeId: nodeId,
              nodeType: 'node'
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
        }, function() {
          return $scope.knowledge.mode === 'edit';
        }],
        ['Add spliter', function($itemScope) {
          var list = $itemScope.child.children;
          var nodeId = appService.uuid();
          list.push({
            node: {
              nodeId: nodeId,
              nodeType: 'spliter'
            },
            editionId: appService.uuid(),
            path: $itemScope.child.path + '/' + nodeId,
            children: [],
            dirty: true
          });
          $scope.knowledge.history.push({
            type: 'add',
            node: list[list.length - 1]
          });
        }, function() {
          return $scope.knowledge.mode === 'edit';
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
        }, function() {
          return $scope.knowledge.mode === 'edit';
        }]
      ],
    };

    // get map
    $scope.knowledge.load();

  }]);