angular.module('app.controllers')
  .controller('KnowledgeBookController', ['$scope', '$state', '$stateParams', '$document', 'AppService', 'KnowledgeService',
    function($scope, $state, $stateParams, $document, appService, knowledgeService) {

    $scope.navbar.current = 'knowledge';

    $scope.knowledge = {
      map: null,
      mode: 'book',
      load: function() {
        var nodeId = $stateParams.nodeId ? $stateParams.nodeId : 'root';
        knowledgeService.getMap(nodeId).then(function(response) {
          $scope.knowledge.map = response.data.map;
        });
      }
    };

    // get map
    $scope.knowledge.load();

    // layout
    $('#map-layout').height($(window).height());
    $('div.below-navbar').css('margin-top', '0px');
    $scope.knowledge.layout = $('#map-layout').layout({
      north: {
        resizerClass: 'resizer-toolbar-hide',
        resizable: false,
        closable: false
      }
    });
    $scope.knowledge.layout.sizePane('north', 91);
    $(window).on('resize', function(){
      $('#map-layout').height($(window).height());
    });

    // scroll
    $('#layout-map').on('scroll', function() {
      $scope.safeApply(function() {
        $scope.knowledge.scroll = $('#layout-map').scrollTop();
      });
    });

  }]);