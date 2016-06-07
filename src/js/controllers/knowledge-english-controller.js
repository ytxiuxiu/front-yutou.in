angular.module('app.controllers')
  .controller('KnowledgeEnglishController', ['$scope', '$state', '$stateParams', '$sce', '$document', 'AppService', 'KnowledgeService',
    function($scope, $state, $stateParams, $sce, $document, appService, knowledgeService) {

    $scope.changeTitle('English - Knowledge Map');

    $scope.english = {
      total: 365,
      finish: 0,
      startDate: new Date(2016, 4 - 1, 28),
      duration: 120,
      pastDays: null,
      endDate: null,
      contributions: {},
      contributionDates: [],
      contributionLevels: [],
      getContributionLevel: function(contributions) {

      },
      getStringOfDate: function (date) {
        date = date ? date : new Date();
        return date.getFullYear() + "-" + 
          (date.getMonth() + 1 < 10 ? "0" : "") + (date.getMonth() + 1) + "-" + 
          (date.getDate() < 10 ? "0" : "") + date.getDate();
      },
      countOneLevel: function(node) {
        if (node.children.length === 0) {
          // add to finish
          $scope.english.finish++;

          // add to contributions
          var date = new Date(node.node.createdAt);
          date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          var exists = false;
          for (var key in $scope.english.contributions) {
            if (key === $scope.english.getStringOfDate(date)) {
              $scope.english.contributions[key]++;
              exists = true;
            }
          }
          if (!exists) {
            $scope.english.contributions[$scope.english.getStringOfDate(date)] = 1;
          }
        } else {
          for (var i = 0, l = node.children.length; i < l; i++) {
            $scope.english.countOneLevel(node.children[i]);
          }
        }
      }
    };

    $scope.english.countOneLevel($scope.knowledge.map);

    // calculate end date
    $scope.english.endDate = new Date();
    $scope.english.endDate.setTime($scope.english.startDate.getTime() + 120 * 24 * 3600 * 1000);
    // calculate past days
    var now = new Date();
    $scope.english.pastDays = (now.getTime() - $scope.english.startDate.getTime()) / (24 * 3600 * 1000);
    // calculate remining days
    $scope.english.reminingDays = ($scope.english.endDate.getTime() - now) / (24 * 3600 * 1000);

    // build contributions
    (function() {
      for (var i = 0; i < $scope.english.duration; i++) {
        var date = new Date($scope.english.startDate.getTime() + i * 24 * 3600 * 1000);
        var exists = false;
        for (var key in $scope.english.contributions) {
          if (key === $scope.english.getStringOfDate(date)) {
            exists = true;
          }
        }
        if (!exists) {
          $scope.english.contributions[$scope.english.getStringOfDate(date)] = 0;
        }
      }
    })();
    (function() {
      for (var key in $scope.english.contributions) {
        $scope.english.contributionDates.push(key);
      }
      $scope.english.contributionDates.sort();
    })();

    // calculate contribution levels
    var itemPerDay = $scope.english.total / $scope.english.duration;
    $scope.english.contributionLevels.push((itemPerDay / 4 * 2) * 1.5);
    $scope.english.contributionLevels.push((itemPerDay / 4 * 3) * 1.5);
    $scope.english.contributionLevels.push(itemPerDay * 1.5);
  }]);