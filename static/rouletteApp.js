/*global angular:false, $scope:false, console:false */
var app = angular.module('timerTenK', []);
 
app.config(['$interpolateProvider', function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[');
    $interpolateProvider.endSymbol(']}');
}]);

app.controller('firstController', ['$scope', '$http', function ($scope, $http) {
    $scope.visible = false;

    $scope.getKeys = function (jsonData) {

        var keys = [];
        for (var i=0; i < jsonData.length; i++){
            keys.push(Object.keys(jsonData[i])[0]);
        };
        return keys;
    };
}]);
