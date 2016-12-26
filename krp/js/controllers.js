var app = angular.module('KitchenRadioPlayer', ['ngRoute','cfp.hotkeys']);
var version = "KitchenRadioPlayer v.0.0.2"
var server="192.168.1.3"
var port=80

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: '/index.html'
  });
}]);

app.factory('socket', ['$rootScope', function($rootScope) {
  var socket = io.connect('ws://'+server+':'+port);

  return {
    on: function(eventName, callback){
      socket.on(eventName, callback);
    },
    emit: function(eventName, data) {
      socket.emit(eventName, data);
    }
  };
}]);

app.controller('IndexController', function($scope, socket, hotkeys) {
 $scope.version = version; 
 $scope.addNewRadio = function() {
    socket.emit('addRadio', $scope.url);
    $scope.url ="";
  };
  
  $scope.playN = function(a, b) {
	var action = {"action": a, "arg": b};
	console.log(action);
    socket.emit('control', action);
  };

  $scope.playF = function(a, b) {
	var action = {"action": a, "arg": b};
    console.log(action);
    socket.emit('control', 'clear');
    socket.emit('control', action);
  };

  socket.on('GlobalControl', function(data) {
    $scope.$apply(function () {
      $scope.title = $scope.current = data.current.substr(0,100);
      $scope.volume = data.volume;
      $scope.ls = data.ls;
      $scope.files = data.files;
      $scope.playlist = data.playlist;
      if (data.current === ""){ $scope.title = version}
    });
  });

	hotkeys.bindTo($scope)
    .add({
      combo: 'up',
      callback: function() {
	    $scope.playN('volume', '+5');
	}
    })

    .add({
      combo: 'down',
      callback: function() {
	    $scope.playN('volume', '-5');
	}
	})

    .add({
      combo: 'right',
      callback: function() {
	    $scope.playN('next', '');
	}})

    .add({
      combo: 'left',
      callback: function() {
	    $scope.playN('prev', '');
	}})
    .add({
      combo: 'esc',
      callback: function() {
	    $scope.playN('stop', '');
	}})
    .add({
      combo: 'space',
      callback: function() {
	    if ($scope.current.length >1){
		    $scope.playN('stop', '');
	    }
	    else {
		$scope.playN('play', '');
		}
	}})






});
