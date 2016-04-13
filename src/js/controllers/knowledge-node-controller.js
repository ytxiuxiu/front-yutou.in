angular.module('app.controllers')
  .controller('KnowledgeNodeController', ['$scope', '$state', '$stateParams', '$document', 'AppService', 'KnowledgeService',
    function($scope, $state, $stateParams, $document, appService, knowledgeService) {

    $scope.navbar.current = 'knowledge';
    $scope.changeTitle('Knowledge');

    $scope.knowledge = {
      node: null,
      mode: 'node',
      load: function() {
        knowledgeService.getMap($stateParams.nodeId).then(function(response) {
          $scope.knowledge.node = response.data.map;
          $scope.changeTitle($scope.knowledge.node.name + ' - Knowledge');
        });
      }
    };

    $scope.knowledge.load();

  }]);