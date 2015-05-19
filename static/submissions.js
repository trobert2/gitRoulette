app.controller('submissions', ['$scope', '$http', function ($scope, $http) {
    $scope.visible = false;
    $scope.stats = {};
    $scope.menuButton = 'submissions';

    $scope.getLocation = function(href) {
        var l = document.createElement("a");
        l.href = href;
        return l;
    };

    $scope.getStats = function(gitUrl) {
        // This should take input the whole object. An id needs to be added so
        // that we can better assciate the output with the table elements 
        var url = $scope.getLocation(gitUrl);
        var pathArray = url.pathname.split('/');

        $http({
            method: "get",
            url: "https://api.github.com/repos/" + pathArray[1] + "/" + pathArray[2] + "/languages",
            headers: {'Accept': 'application/json',
                      'Content-Type': "application/json"},
        }).success(function (response) {
            var total = 0;
            var percentage = {};

            keys = Object.keys(response);

            for (var i=0; i < keys.length; i++){
                total += response[keys[i]];
            }
            for (var i=0; i < keys.length; i++){
                percentage[keys[i]] = Math.round((response[keys[i]] * 100 / total)*100)/100;
            }
            $scope.stats[gitUrl] = percentage
        });
    };

    $scope.addForReview = function () {
        $scope.showWarning = false;
        $scope.showGithubWarning = false;
        if (!$scope.newName || !$scope.newUrl) {
            $scope.showWarning = true;
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
