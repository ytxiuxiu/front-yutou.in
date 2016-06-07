angular.module('app.controllers')
  .controller('KnowledgeMusicController', ['$scope', '$state', '$stateParams', '$sce', '$document', 'AppService', 'KnowledgeService',
    function($scope, $state, $stateParams, $sce, $document, appService, knowledgeService) {

    $scope.changeTitle('Music Time! - Knowledge Map');

    $scope.music = {
      mode: 'random',
      state: 'playing',
      player: new YT.Player('music-player', {
        height: '270',
        width: '480',
        playerVars: {
          controls: 0,
          showinfo: 0
        },
        events: {
          'onReady': function() {},
          'onStateChange': function(state) {
            switch (state.data) {
              case -1:  // unstarted
                break;
              case YT.PlayerState.BUFFERING:
                break;
              case YT.PlayerState.PLAYING:
                $scope.safeApply(function() {
                  $scope.music.state = 'playing';
                });
                break;
              case YT.PlayerState.PAUSED:
                $scope.safeApply(function() {
                  $scope.music.state = 'pause';
                });
                break;
              case YT.PlayerState.ENDED:
                var mode = $scope.music.mode;
                $scope.music.next();
                break;
              default:
                break;
            }
          }
        }
      }),
      load: function(id) {
        var load = setInterval(function() {
          try {
            $scope.music.player.loadVideoById(id, 0, 'large');
            clearInterval(load);
          } catch (e) {
          }
        }, 100);
        
      },
      play: function() {
        $scope.music.player.playVideo();
      },
      pause: function() {
        $scope.music.player.pauseVideo();
      },
      next: function(music) {
        // remove highlight of the last one
        console.log($scope.music.currentMusic);
        if ($scope.music.currentMusic !== null) {
          var $node = $('#node-' + $scope.music.found[$scope.music.currentMusic].node.nodeId);
          console.log($node);
          $node.find('.node-box').css('background-color', '').css('color', '');
          $node.find('a').css('color', '');
        }

        // find next
        if (music !== undefined) {
          $scope.music.currentMusic = music;
        } else {
          if ($scope.music.mode === 'random') { // random
            $scope.safeApply(function() {
              $scope.music.currentMusic = Math.floor(Math.random() * $scope.music.found.length);
            });
          } else {  // normal
            if ($scope.music.currentMusic >= $scope.music.found.length - 1) {
              $scope.music.currentMusic = 0;
            } else {
              $scope.music.currentMusic++;
            }
          }
        }
        // play
        $scope.music.load($scope.music.found[$scope.music.currentMusic].videoId);

        // highlight the node
        var highlight = setInterval(function() {
          try {
            var $node = $('#node-' + $scope.music.found[$scope.music.currentMusic].node.nodeId);
            $node.find('.node-box').css('background-color', '#b7db56').css('color', '#ffffff');
            $node.find('a').css('color', '#ffffff');
            if ($node.get(0)) {
              clearInterval(highlight);
            }
          } catch (e) {}
        }, 100);
        
      },
      getVideoIdFromContent: function(content) {
        var patt = /\[video\]\[(.*)\]/i;
        var result = content.match(patt);
        return result[1];
      },
      currentMusic: null,
      found: [],
      findAllWithVideo: function(inNode) {
        for (var j = 0, lj = inNode.children.length; j < lj; j++) {
          var content = inNode.children[j].content;
          if (content && content.includes('[video]')) {
            $scope.music.found.push(inNode.children[j]);
          }
          for (var i = 0, l = inNode.children[j].children.length; i < l; i++) {
            $scope.music.findAllWithVideo(inNode.children[j].children[i]);
          }
        }
      },
      init: function() {
        // find all music
        $scope.music.findAllWithVideo($scope.knowledge.map);
        for (var i = 0, l = $scope.music.found.length; i < l; i++) {
          $scope.music.found[i].videoId = $scope.music.getVideoIdFromContent($scope.music.found[i].content);
        }

        // random first music
        if ($scope.music.found.length >= 1) {
          $scope.music.next();
        }
      },
    };

    $scope.music.init();

    $('.map').delegate('.node', 'click', function(event) {
      return false;
    });

    // play select music
    $('.map').delegate('.node', 'dblclick', function(event) {
      for (var i = 0, l = $scope.music.found.length; i < l; i++) {
        if ($scope.music.found[i].node.nodeId === event.currentTarget.id.substring(5)) {
          $scope.music.next(i);
        }
      }
      return false;
    });

    // $('body').mousemove(function() {
    //   var x = event.pageX,
    //     y = event.pageY,
    //     w = $(window).width(),
    //     h = $(window).height();

    //   if (y < h / 2) {
    //     $('#music-player').css('top', '').css('right', '20px').css('bottom', '20px').css('left', '');
    //   } else {
    //     $('#music-player').css('top', '120px').css('right', '20px').css('bottom', '').css('left', '');
    //   }
      

    // });

  }]);