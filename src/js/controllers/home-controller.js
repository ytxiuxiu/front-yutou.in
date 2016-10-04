angular.module('app.controllers')
  .controller('HomeController', ['$scope', '$firebaseArray', function($scope, $firebaseArray) {

    $scope.navbar.current = 'home';
    $scope.changeTitle('Home');

    var config = {
      apiKey: "AIzaSyB4uJCXQzODW3rRT1E9WyqjfIl8fH3cqVc",
      authDomain: "travel-9dd3e.firebaseapp.com",
      databaseURL: "https://travel-9dd3e.firebaseio.com",
      storageBucket: "travel-9dd3e.appspot.com",
    };
    firebase.initializeApp(config);

    var ref = firebase.database().ref().child('place-list');
    var places = $firebaseArray(ref);
    $scope.places = [];
    places.$watch(function() {
      $scope.places = [];
      for (var i = places.length - 1; i >= places.length - 4, i >= 0; i--) {
        $scope.places.push(places[i]);
      }
    });


  }]);