angular.module('app.controllers')
  .controller('KnowledgeNodeController', ['$scope', '$state', '$stateParams', '$document', 'AppService', 'KnowledgeService',
    function($scope, $state, $stateParams, $document, appService, knowledgeService) {

    $scope.navbar.current = 'knowledge';
    $scope.changeTitle('Knowledge');

    $scope.editorParams = {};
    angular.extend($scope.editorParams, {
      element: document.getElementById('node-content-editor')
    }, common.editor);

    $scope.knowledge = {
      node: null,
      edit: 'off',
      load: function() {
        knowledgeService.getNode($stateParams.nodeId).then(function(response) {
          $scope.knowledge.node = response.data.node;
          $scope.changeTitle($scope.knowledge.node.currentEdition.name + ' - Knowledge');
          $scope.knowledge.contentEditor.value($scope.knowledge.node.currentEdition.content ? $scope.knowledge.node.currentEdition.content : '');
        });
      },
      contentEditor: new SimpleMDE($scope.editorParams),
      save: function() {
        $scope.knowledge.node.currentEdition.editionId = appService.uuid();
        $scope.knowledge.node.node = $scope.knowledge.node.currentEdition;
        knowledgeService.addEdition($scope.knowledge.node).then(function(response) {
          $scope.knowledge.load();
        });

      }
    };

    $scope.knowledge.load();

    $scope.knowledge.contentEditor.codemirror.on('change', function() {
      var node = $scope.knowledge.node.currentEdition;
      $scope.safeApply(function() {
        node.editionId = appService.uuid();
        node.content = $scope.knowledge.contentEditor.value();
        node.dirty = true;
      });
    });

  }]);