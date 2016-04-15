angular.module('app.controllers')
  .controller('KnowledgeController', ['$scope', '$state', '$stateParams', '$sce', '$document', 'AppService', 'KnowledgeService',
    function($scope, $state, $stateParams, $sce, $document, appService, knowledgeService) {

    $scope.navbar.current = 'knowledge';
    $scope.changeTitle('Knowledge Map');

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
        var nodeId = $stateParams.nodeId ? $stateParams.nodeId : 'root';
        knowledgeService.getMap(nodeId).then(function(response) {
          $scope.knowledge.map = response.data.map;
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
      popover: 'templates/knowledge/popover.tpl.html',
      open: function() {
        $state.go('knowledge-node', { nodeId: $scope.knowledge.currentEditing.node.nodeId });
      },
      showAfter: function() {
        $state.go('knowledge', { nodeId: $scope.knowledge.currentEditing.node.nodeId });
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
          $state.go('knowledge', { nodeId: $itemScope.child.node.nodeId });
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
          table: ["", "\n| column1 | column2 | column3 |\n| -----------  | ----------- | ----------- |\n| text1         | text2        | text3        |\n| text1         | text2        | text3        |\n"],
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