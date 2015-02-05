/*global angular:false, $scope:false, console:false */
var app = angular.module('rouletteApp', []);
 
app.config(['$interpolateProvider', function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[');
    $interpolateProvider.endSymbol(']}');
}]);

app.controller('firstController', ['$scope', '$http', function ($scope, $http) {
    $scope.visible = false;

    $scope.addForReview = function () {
        var _new_name = $scope.newName.trim();
        var _new = $scope.newUrl.trim();

        var obj = JSON.parse('{"name": "' + _new_name + '", "url": "' + _new + '"}');
        console.log(_new)
        console.log(_new_name)

        if (!_new || !_new_name) {
            return;
        }

        for (var i=0; i < $scope.existing.length; i++){
            if (Object.keys($scope.existing[i])[0] == _new){
                return;
                }
            }
        
        $scope.existing.push(obj);
        
        $http({
            method: "post",
            url: "/add_for_review",
            headers: {'Content-Type': "application/json"},
            data: obj
        }).success(function () {
            console.log("success!");
        });

        $scope._new = '';
    };

    $scope.removeUrl = function (url) {
        for (var i=0; i < $scope.existing.length; i++){
            if ($scope.existing[i]["url"] == url['url']){
                $scope.existing.splice(i, 1)

            $http({
                method: "post",
                url: "/remove_from_list",
                headers: {'Content-Type': "application/json"},
                data: url
            }).success(function () {
                console.log("success!");
            });
            }
        }
    };

}]);
