angular.module('app.controllers')
  .controller('DictController', ['$scope', '$state', '$stateParams', '$document', 'AppService', 'KnowledgeService',
    function($scope, $state, $stateParams, $document, appService, knowledgeService) {

    $scope.navbar.current = 'knowledge';
    $scope.changeTitle('Dictionary');

    $scope.dict = {
      keyword: null,
      result: null,
      find: function() {
        knowledgeService.dictFind($scope.dict.keyword).then(function(response) {
          $scope.dict.result = response.data.result;
        });
      },
      go: function() {
        $state.go('dict', { keyword: $scope.dict.keyword });
      }
    };

    if ($stateParams.keyword) {
      $scope.dict.keyword = $stateParams.keyword;
      $scope.changeTitle($scope.dict.keyword + ' - Dictionary');
      $scope.dict.find();
    }

  }]);