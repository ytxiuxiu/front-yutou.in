angular.module('app.controllers')
  .controller('DictController', ['$scope', '$state', '$stateParams', '$document', '$localStorage', 'ngAudio', 'AppService', 'KnowledgeService',
    function($scope, $state, $stateParams, $document, $localStorage, ngAudio, appService, knowledgeService) {

    $scope.navbar.current = 'knowledge';
    $scope.changeTitle('Dictionary');

    $scope.dict = {
      keyword: null,
      result: null,
      find: function() {
        knowledgeService.dictFind($scope.dict.keyword).then(function(response) {
          $scope.dict.result = response.data.result;
          $scope.dict.empty = false;
          $('input.word').focus();

          // get finding history
          if ($localStorage.auth && $localStorage.auth.loginToken) {
            knowledgeService.findHistory($scope.dict.result.wordId).then(function(response) {
              $scope.dict.history = response.data.history;
            });
          }

        });
      },
      go: function() {
        $state.go('dict', { keyword: $scope.dict.keyword });
      },
      play: function(sound) {
        ngAudio.play(sound);
      },
      empty: true
    };

    if ($stateParams.keyword) {
      $scope.dict.keyword = $stateParams.keyword;
      $scope.changeTitle($scope.dict.keyword + ' - Dictionary');
      $scope.dict.find();
      $scope.dict.empty = false;
      $('input.word').focus();
    } else {
      $('input.word-empty').focus();
    }

  }]);