angular.module('app.controllers')
  .controller('EditorController', ['$scope', '$state', '$stateParams', '$sce', '$document', 'toastr', 
    'AppService', 'KnowledgeService',
    function($scope, $state, $stateParams, $sce, $document, toastr, appService, knowledgeService) {

    $scope.editorParams = {};
    angular.extend($scope.editorParams, {
      element: document.getElementById('editor')
    }, common.editor);

    $scope.editor = {
      editor: new SimpleMDE($scope.editorParams),
      storage: $scope.$storage.editor,

      add: function() {
        $scope.$storage.editor.saves.push({
          title: '',
          content: ''
        });
        $scope.editor.switchEditing($scope.$storage.editor.saves.length - 1);
      },
      switchEditing: function(index) {
        $scope.$storage.editor.currentEditing = index;
        $scope.editor.loadToEditor();
      },
      loadToEditor: function() {
        if ($scope.$storage.editor.saves[$scope.$storage.editor.currentEditing]) {
          $scope.editor.editor.value($scope.$storage.editor.saves[$scope.$storage.editor.currentEditing].content);
        } else {
          $scope.editor.editor.value('');
        }
      },
      remove: function() {
        $scope.$storage.editor.saves.splice($scope.$storage.editor.currentEditing, 1);
        $scope.editor.loadToEditor();
      }
    };

    $scope.editor.loadToEditor();
    $scope.editor.editor.codemirror.on('change', function() {
      if ($scope.$storage.editor.saves[$scope.$storage.editor.currentEditing])
        $scope.$storage.editor.saves[$scope.$storage.editor.currentEditing].content = $scope.editor.editor.value();
    });

  }]);