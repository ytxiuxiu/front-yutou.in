var GOOGLE_LOGIN_API_GLIENT_ID = '302391598041-f0rue0f55c2lvi8vhpbgakpgm8t2k8ug.apps.googleusercontent.com';

angular.module('app.controllers')
  .controller('AppController', [
    '$scope', '$state', '$anchorScroll', '$location', '$localStorage', '$uibModal', 'toastr', 'AppService', 
    function($scope, $state, $anchorScroll, $location, $localStorage, $uibModal, toastr, appService) {
    $scope.navbar = {};
    $scope.theme = {
      current: '5mps'
    };
    $scope.$storage = $localStorage;

    function openUpdateModal() {
      $uibModal.open({
        animation: true,
        templateUrl: 'templates/home/modal-update.tpl.html'
      });
    }
    appService.getSiteStatus().then(function(response) {
      if (response.data.status.update === 'true') {
        openUpdateModal();
      }
    }, function(response) {
      openUpdateModal();
    });
    

    /*
     * Login
     */
    $scope.$on('event:google-plus-signin-success', function (event, authResult) {
      appService.login(authResult.id_token).then(function(response) {
        $scope.auth.user = response.data.user;
        // store idToken in local storage
        $scope.$storage.auth = {
          loginToken: response.data.loginToken
        };
        $scope.toast.open('success', 'Logined successfully :)');
        if ($scope.auth.loginModal) {
          $scope.auth.loginModal.close();
        }
        $scope.refresh();
      });
    });
    $scope.$on('event:google-plus-signin-failure', function (event, authResult) {
      // Auth failure or signout detected
    });

    $scope.auth = {
      user: {},
      openLoginModal: function(size) {
        $scope.auth.loginModal = $uibModal.open({
          animation: true,
          templateUrl: 'templates/home/modal-login.tpl.html',
          size: size,
        });
      },
      loginModal: null,
      logout: function() {
        $scope.$storage.auth.loginToken = null;
        $scope.auth.user = null;
        $scope.refresh();
      }
    };

    if ($scope.$storage.auth && $scope.$storage.auth.loginToken) {
      // if loginToken in local storage
      appService.auth($scope.$storage.auth.loginToken).then(function(response) {
        $scope.auth.user = response.data.user;
      }).catch(function(response) {
        $scope.toast.open('info', 'Login timout! Please login again.');
      });
    }

    /*
     * Common
     */
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
      $('title').text(title + (suffix ? ' - Yutou.in - Yingchen盈琛 Liu刘\'s personal website' : ''));
    };

    $scope.refresh = function() {
      window.location.reload();
    };

    /*
     * toastr
     */
    $scope.toast = {
      history: [],
      open: function(type, message, title, params) {
        var history = $scope.toast.history;
        // avoid duplicate messages
        for (var i = 0, l = history.length; i < l; i++) {
          if (new Date() - history[i].openTime < 10000 && history[i].scope.message === message) {
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

    /*
     * http request handler
     */
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