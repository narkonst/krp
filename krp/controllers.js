var app = angular.module('KitchenRadioPlayer', ['ngRoute']);
var version = "KitchenRadioPlayer v.0.0.2"
var server="192.168.1.235"
//var server="62.182.198.11"
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

app.controller('IndexController', function($scope, socket) {
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


  socket.on('GlobalControl', function(data) {
    $scope.$apply(function () {
      $scope.title = $scope.current = data.current;
      $scope.volume = data.volume;
      $scope.playlist = data.playlist;
      if (data.current === ""){ $scope.title = version}
    });
  });
});
