angular.module('app.controllers')
  .controller('KnowledgeNodeController', ['$scope', '$state', '$stateParams', '$document', 'AppService', 'KnowledgeService',
    function($scope, $state, $stateParams, $document, appService, knowledgeService) {

    $scope.navbar.current = 'knowledge';
    $scope.changeTitle('Knowledge');

    $scope.knowledge = {
      node: null,
      mode: 'node',
      load: function() {
        knowledgeService.getNode($stateParams.nodeId).then(function(response) {
          $scope.knowledge.node = response.data.node;
          $scope.changeTitle($scope.knowledge.node.currentEdition.name + ' - Knowledge');
        });
      }
    };

    $scope.knowledge.load();

  }]);