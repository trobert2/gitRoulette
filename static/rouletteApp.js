/*global angular:false, $scope:false, console:false */
var app = angular.module('rouletteApp', []);
 
app.config(['$interpolateProvider', function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[');
    $interpolateProvider.endSymbol(']}');
}]);
