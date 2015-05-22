app.controller('reviewsReceived', ['$scope', '$http', function ($scope, $http) {
    //TODO: Order/group them by project
    $scope.comments = {};

    $scope.getLocation = function(href) {
        var l = document.createElement("a");
        l.href = href;
        return l;
    };

    $scope.getEntryComment = function(){
        //for (var i=0; i < $scope.existing.length; i++){
        $scope.existing.forEach(function(element){
            var _url = $scope.getLocation(element["url"]);
            var pathArray = _url.pathname.split('/');
            if (pathArray[3] == "pull"){
                pathArray[3] = "issue";
            }
            if(Object.keys($scope.comments).indexOf() < 0){
                $scope.comments[pathArray[2]] = []; 
            }
            // console.log("https://api.github.com/repos/" + pathArray[1] + "/" + pathArray[2] + "/" + pathArray[3] + "s/" + pathArray[4] + "/comments")

            $http({
                method: "get",
                url: "https://api.github.com/repos/" + pathArray[1] + "/" + pathArray[2] + "/" + pathArray[3] + "s/" + pathArray[4] + "/comments",
                headers: {'Accept': 'application/json',
                          'Authorization': 'token ' + $scope.token,
                          'Content-Type': "application/json"},
            }).success(function (response) {
                for (var i=0; i < response.length; i++){
                    $scope.comments[pathArray[2]].push(response[i]);
                }
            });
        });
    };

    $scope.$on('addedNewController', function(event, args) {
        $scope.getEntryComment();
    });
}]);
