angular.module('app.controllers')
  .controller('KnowledgeController', ['$scope', '$state', '$stateParams', '$sce', '$document', 'AppService', 'KnowledgeService',
    function($scope, $state, $stateParams, $sce, $document, appService, knowledgeService) {

    $scope.navbar.current = 'knowledge';
    $scope.changeTitle('Knowledge Map');

    $scope.editorParams = {};
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
      zoom: 100,
      zommIn: function() {
        if ($scope.knowledge.zoom <= 100) {
          $scope.knowledge.zoom += 10;
        }
      },
      zoomOut: function() {
        if ($scope.knowledge.zoom >= 70) {
          $scope.knowledge.zoom -= 10;
        }
      },
      load: function() {
        var nodeId = $stateParams.nodeId ? $stateParams.nodeId : 'root';
        knowledgeService.getMap(nodeId).then(function(response) {
          $scope.knowledge.map = response.data.map;
          $scope.changeTitle($scope.knowledge.map.name + ' - Knowledge Map');
        });
      },
      onDragstart: function(list, event) {
        list.dragging = true;
        if (event.dataTransfer.setDragImage) {
          var img = new Image();
          img.src = '';
          event.dataTransfer.setDragImage(img, 0, 0);
        }
      },
      move: function(child) {
          $scope.knowledge.find(child.node.nodeId, $scope.knowledge.map);
          console.log($scope.knowledge.found);
          console.log($scope.knowledge.foundParent);
        // for (var i = 0, l = list.length; i < l; i++) {
        //   if (list[i].node.nodeId === child.node.nodeId) {
        //     break;
        //   }
        // }
        //console.log(i);

        
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
      showContent: function(node) {
        $scope.knowledge.currentEditing = node;
        if (node.content && node.content != '' || $scope.knowledge.mode === 'edit') {
          if ($(window).width() > 425) {
            if ($scope.knowledge.editor.isBig) {
              $scope.knowledge.editor.big();
            } else {
              $scope.knowledge.editor.small();
            }
            $scope.knowledge.contentEditor.value(node.content ? node.content : '');
          }
        } else {
          $scope.knowledge.editor.close();
        }
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
      contentEditor: new SimpleMDE($scope.editorParams),
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
            $scope.knowledge.saving = true;
            knowledgeService.addEdition(saveList[i]).then(function(response) {
              var edition = response.data.node;
              var nodeId = edition.node.nodeId;
              for (var j = 0, lj = history.length; j < lj; j++) {
                while (history[j] && history[j].node.node.nodeId === nodeId) {
                  history[j].node.dirty = false;
                  history.splice(j, 1);
                }
              }
              if (history.length === 0) {
                $scope.knowledge.saving = false;
                $scope.toast.open('success', 'All changes saved successfully :)');
              }
            });
          }
        })();
        saveList.splice(0, saveList.length);

        console.log(saveList);
      },
      editor: {
        isBig: false,
        big: function() {
          $scope.knowledge.layout.open('south');
          $scope.knowledge.layout.sizePane('south', $(window).height());
          $scope.knowledge.editor.isBig = true;
        },
        small: function() {
          $scope.knowledge.layout.open('south');
          $scope.knowledge.layout.sizePane('south', $(window).height() * 0.4);
          $scope.knowledge.editor.isBig = false;
        },
        close: function() {
          $scope.knowledge.layout.close('south');
          $scope.knowledge.editor.isBig = false;
        }
      }
    };

    // get map
    $scope.knowledge.load();

    // editor
    $scope.knowledge.contentEditor.codemirror.on('change', function() {
      if ($scope.knowledge.currentEditing && $scope.knowledge.mode === 'edit' && $scope.knowledge.contentEditor.value() !== $scope.knowledge.currentEditing.content) {
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

    $('#map-layout').height($(window).height());
    $('div.below-navbar').css('margin-top', '0px');
    $scope.knowledge.layout = $('#map-layout').layout({
      north: {
        resizerClass: 'resizer-toolbar-hide',
        resizable: false,
        closable: false
      },
      onresize: function(name, element, state, options, name) {
        $('.CodeMirror').height($('.CodeMirror').parent().parent().height() - 135);
      }
    });
    $scope.knowledge.layout.sizePane('north', 91);

    $scope.knowledge.layout.close('south');
    $(window).on('resize', function(){
      $('#map-layout').height($(window).height());
      $('#map-layout').width($(window).width());
      toggleToolbar();
    });

    function toggleToolbar() {
      if ($(window).width() <= 425) {
        $scope.knowledge.layout.hide('north');
        $scope.knowledge.layout.hide('south');
        $scope.knowledge.popover = 'templates/knowledge/popover.tpl.html';
      } else {
        $scope.knowledge.layout.show('north');
        $scope.knowledge.layout.show('south');
        $scope.knowledge.popover = '';
      }
    }
    toggleToolbar();

    $scope.$watch('knowledge.mode', function() {
      $scope.knowledge.editor.close();
    });

    $('.editor-container').delegate('.editor-toolbar a', 'click', function() {
      var title = $(this).attr('title');
      if (title.startsWith('Toggle Side by Side')) {
        $scope.knowledge.editor.isBig = true;
      } else if (title.startsWith('Toggle Fullscreen')) {
        $scope.knowledge.editor.isBig = !$scope.knowledge.editor.isBig;
      }
      
      if ($scope.knowledge.editor.isBig) {
        $scope.knowledge.editor.big();
      } else {
        $scope.knowledge.editor.small();
      }
    });

  }]);