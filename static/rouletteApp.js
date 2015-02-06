/*global angular:false, $scope:false, console:false */
var app = angular.module('rouletteApp', []);
 
app.config(['$interpolateProvider', function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[');
    $interpolateProvider.endSymbol(']}');
}]);

app.controller('firstController', ['$scope', '$http', function ($scope, $http) {
    $scope.visible = false;
    $scope.showWarning = false;
    $scope.showGithubWarning = false;

    $scope.getLocation = function(href) {
        var l = document.createElement("a");
        l.href = href;
        return l;
    };

    $scope.getStats = function(url) {
        url = url['url'];
        var url = $scope.getLocation(url);
        var pathArray = url.pathname.split('/');

        if (url.hostname != "github.com"){
            //TODO: tell not a github url
            console.log("Not a github url!");
            return;
        }
        $http({
            method: "get",
            url: "https://api.github.com/repos/" + pathArray[1] + "/" + pathArray[2] + "/languages",
            headers: {'Accept': 'application/json',
                      'Content-Type': "application/json"},
        }).success(function (response) {
            var total = 0;
            var percentageFinal = {};

            keys = Object.keys(response);

            for (var i=0; i < keys.length; i++){
                total += response[keys[i]];
            }
            for (var i=0; i < keys.length; i++){
                percentageFinal[keys[i]] = response[keys[i]] * 100 / total;
            }
            console.log(percentageFinal)
            return percentageFinal;
        });
    };

    $scope.addForReview = function () {

        if (!$scope.newName || !$scope.newUrl) {
            $scope.showWarning = true;
            console.log($scope.newName)
            console.log($scope.newUrl)

            return;
        }

        var _new_name = $scope.newName.trim();
        var _new = $scope.newUrl.trim();

        if (!_new || !_new_name) {
            $scope.showWarning = true;
            return;
        }

        if (!_new || !_new_name) {
            $scope.showWarning = true;
            return;
        }

        var _newUrl = $scope.getLocation(_new);
        if (_newUrl.hostname != "github.com"){
            console.log(_newUrl.hostname)
            $scope.showGithubWarning = true;
            return;
        }
        var obj = JSON.parse('{"name": "' + _new_name + '", "url": "' + _new + '"}');
        
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
        $scope.showUWarning = false;
        $scope.showGithubWarning = false;
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
