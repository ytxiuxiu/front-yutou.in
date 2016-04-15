var GOOGLE_LOGIN_API_GLIENT_ID = '302391598041-f0rue0f55c2lvi8vhpbgakpgm8t2k8ug.apps.googleusercontent.com';

angular.module('app.controllers')
  .controller('AppController', ['$scope', '$state', '$anchorScroll', '$location', '$localStorage', 'toastr', 'AppService', function($scope, $state, $anchorScroll, $location, $localStorage, toastr, appService) {
    $scope.navbar = {};
    $scope.theme = {
      current: '5mps'
    };

    $scope.gotoAnchor = function(x, element) {
      element = element === undefined ? 'body' : element;
      var position = $('#' + x).position();
      if (position) {
        $(element).animate({
          scrollTop: position.top
        }, 300);
      }
    };

    $scope.back = function() {
      window.history.back();
    };

    $scope.changeTitle = function(title, suffix) {
      suffix = suffix === undefined ? true : suffix;
      $('title').text(title + (suffix ? ' - Yutou.in' : ''));
    };

    $scope.auth = {
      user: {},
      logout: function() {
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function() {
          $scope.auth.user = {};
          $scope.$storage.auth = null;
          $scope.$apply();

          // refresh
          $state.go($state.current, {}, {reload: true});
          $scope.$broadcast('auth.user.change', $scope.auth.user);
        });
      }
    };
    $scope.$storage = $localStorage;

    $scope.safeApply = function(fn) {
      var phase = this.$root.$$phase;
      if (phase == '$apply' || phase == '$digest') {
        if (fn && (typeof(fn) === 'function')) {
          fn();
        }
      } else {
        this.$apply(fn);
      }
    };

    // toastr
    $scope.toast = {
      history: [],
      open: function(type, message, title, params) {
        var history = $scope.toast.history;
        // avoid duplicate messages
        for (var i = 0, l = history.length; i < l; i++) {
          if (new Date() - history[i].openTime < 1000 && history[i].scope.message === message) {
            return;
          }
        }
        switch (type) {
          case 'success':
            history.push(toastr.success(message, title, params));
            break;
          case 'error':
            history.push(toastr.error(message, title, params));
            break;
          case 'warning':
            history.push(toastr.warning(message, title, params));
            break;
          default:
            history.push(toastr.info(message, title, params));
            break;
        }
        history[history.length - 1].openTime = new Date();
      }
    };

    // auth
    if ($scope.$storage.auth && $scope.$storage.auth.idToken) {
      // if idToken in local storage
      appService.auth($scope.$storage.auth.idToken).then(function(response) {
        $scope.auth.user = response.data.user;
        $scope.$broadcast('auth.user.change', $scope.auth.user);
      }).catch(function(response) {
        $scope.toast.open('info', 'Login timout! Please login again.');
      });
    }

    // init login button
    gapi.load('auth2', function() {
      auth2 = gapi.auth2.init({
        client_id: GOOGLE_LOGIN_API_GLIENT_ID,
        cookiepolicy: 'single_host_origin',
        scope: 'email profile'
      });
      auth2.attachClickHandler(document.getElementById('btn-login'), {}, function(googleUser) {
        var idToken = googleUser.getAuthResponse().id_token;
        // auth
        appService.auth(idToken).then(function(response) {
          $scope.auth.user = response.data.user;
          // store idToken in local storage
          $scope.$storage.auth = {
            idToken: idToken
          };
          $scope.toast.open('success', 'Logined successfully :)');
          // refresh
          $state.go($state.current, {}, {reload: true});
          $scope.$broadcast('auth.user.change', $scope.auth.user);
        });
      }, function(error) {
        console.log(JSON.stringify(error, undefined, 2));
      });
    });

    // http request handler
    $scope.$on('httpRequestError', function(event, error) {
      switch (error.status) {
        case 404:
          $scope.toast.open('error', 'Sorry, Server is currently not available. Please try later.');
          break;
        case 500:
          $scope.toast.open('error', error.data.message);
          break;
        case 502:
          $scope.toast.open('error', 'Sorry, Server is currently not available. Please try later.');
          break;
      }
    });
  }]);