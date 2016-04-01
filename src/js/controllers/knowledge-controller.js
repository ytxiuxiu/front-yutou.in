angular.module('app.controllers')
  .controller('KnowledgeController', ['$scope', '$state', '$stateParams', 'AppService', 'KnowledgeService',
    function($scope, $state, $stateParams, appService, knowledgeService) {

    $scope.knowledge = {
      map: null,
      mode: 'normal',
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
        ['Show content', function($itemScope) {
          $scope.knowledge.contentEditor.value($itemScope.child.content);
          $scope.knowledge.currentEditing = $itemScope.child;
        }, function($itemScope) {
          return $itemScope.child.content;
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
      change: function(node) {
        node.editionId = appService.uuid();
        node.dirty = true;
        $scope.knowledge.history.push({
          type: 'update',
          node: node
        });
      },
      currentEditing: {
        content: ''
      },
      contentEditor: new SimpleMDE({
        element: document.getElementById('node-content-editor'),
        forceSync: true,
        placeholder: 'Type here...! Supports Markdown :)',
        tabSize: 4,
        toolbar: [
          "bold", "italic", "heading", "|", 
          "quote", "code", "|", 
          "unordered-list", "ordered-list", "|", 
          "link", "image", "table", "horizontal-rule", "|",
          "preview", "side-by-side", "fullscreen", "|",
          {
            name: "markdown",
            action: function() {
              var win = window.open('http://daringfireball.net/projects/markdown/', '_blank');
              win.focus();
            },
            className: "fa fa-question-circle",
            title: "Guide"
          }
        ],
        insertTexts: {
          horizontalRule: ["", "\n-----\n"],
          table: ["", "\n| column 1 | column 2 | column 3 |\n| -----------  | ----------- | ----------- |\n| text 1         | text 2        | text 3        |\n| text 1         | text 2        | text 3        |\n"],
        },
        renderingConfig: {
          codeSyntaxHighlighting: true
        },
        blockStyles: {
          italic: '_'
        }
      }),
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
    $scope.onDragstart = function(list, event) {
       list.dragging = true;
       if (event.dataTransfer.setDragImage) {
         var img = new Image();
         img.src = 'images/node.png';
         event.dataTransfer.setDragImage(img, 0, 0);
       }
    };

    // get map
    var nodeId = $stateParams.nodeId ? $stateParams.nodeId : 'root';
    knowledgeService.getMap(nodeId).then(function(response) {
      $scope.knowledge.map = response.data.map;
    });

    // editor
    $scope.$on('ui.layout.resize', function(e, beforeContainer, afterContainer) {
      var codeMirror = document.getElementsByClassName('CodeMirror')[0];
      codeMirror.setAttribute('style', 'height: ' + (afterContainer.size - 70) + 'px');
    });

    $scope.knowledge.contentEditor.codemirror.on('change', function() {
      if ($scope.knowledge.currentEditing) {
        var node = $scope.knowledge.currentEditing;
        if (node.node) {  // this event will happen when the editor first rended
          $scope.safeApply(function() {
            node.editionId = appService.uuid();
            node.content = $scope.knowledge.contentEditor.value();
            node.dirty = true;
            $scope.knowledge.history.push({
              type: 'update',
              node: node
            });
          });
        }
      }
    });
  }]);