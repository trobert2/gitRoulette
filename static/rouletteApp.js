/*global angular:false, $scope:false, console:false */
var app = angular.module('rouletteApp', ["checklist-model"]);
 
app.config(['$interpolateProvider', function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[');
    $interpolateProvider.endSymbol(']}');
}]);

app.factory('globalHelpers', ['$http', function($http) { my = {
    chunk : function(arr, size) {
      var newArr = [];
      for (var i=0; i<arr.length; i+=size) {
        newArr.push(arr.slice(i, i+size));
      }
      return newArr;
    },

    getLocation : function(href) {
        var l = document.createElement("a");
        l.href = href;
        return l;
    },
    
    getStatsPromise : function(gitUrl, token){
        var url = my.getLocation(gitUrl);
        var pathArray = url.pathname.split('/');
        var promise = $http({
            method: "get",
            url: "https://api.github.com/repos/" + pathArray[1] + "/" + pathArray[2] + "/languages",
            headers: {'Accept': 'application/json',
                      'Authorization': 'token ' + token,
                      'Content-Type': "application/json"},
        })
        return promise; 
    },

    getStatsPercentage : function(gitUrl, token) {
        // This should take input the whole object. An id needs to be added so
        // that we can better assciate the output with the table elements 
        promise = my.getStatsPromise(gitUrl, token)
        var percentage = {};
        //TODO: add route on server and a call here to it. store stats in DB. add update stats button.

        promise.then(function (response) {
            data = response.data;
            var total = 0;

            keys = Object.keys(data);

            for (var i=0; i < keys.length; i++){
                total += data[keys[i]];
            }
            for (var i=0; i < keys.length; i++){
                percentage[keys[i]] = Math.round((data[keys[i]] * 100 / total)*100)/100;
            }
        });
        return percentage;
    }

    }
    return my;
}]);
