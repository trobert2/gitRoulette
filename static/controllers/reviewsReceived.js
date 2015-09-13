app.controller('reviewsReceived', ['$scope', '$http', 'globalHelpers', function ($scope, $http, globalHelpers) {
    //TODO: Order/group them by project
    $scope.comments = {};

    $scope.getEntryComment = function(){
        //for (var i=0; i < $scope.existing.length; i++){
        $scope.existing.forEach(function(element){
            var _url = globalHelpers.getLocation(element["url"]);
            var pathArray = _url.pathname.split('/');
            if (pathArray[3] == "pull"){
                pathArray[3] = "issue";
            }
            if(Object.keys($scope.comments).indexOf() < 0){
                $scope.comments[pathArray[2]] = []; 
            }

            $http({
                method: "get",
                url: "https://api.github.com/repos/" + pathArray[1] + "/" + pathArray[2] + "/" + pathArray[3] + "s/" + pathArray[4] + "/comments",
                headers: {'Accept': 'application/json',
                          'Authorization': 'token ' + $scope.token,
                          'Content-Type': "application/json"},
            }).success(function (response) {
                for (var i=0; i < response.length; i++){
                    // Date.parse(response[i]["created_at"]) >= Date.parse(element['entry_time'])) add later on to show onlyreviews after post
                        $scope.comments[pathArray[2]].push(response[i]);
                }
            });
        });
    };

    $scope.goodJob = function (entry){
        console.log(entry);
    }

    $scope.noThanks = function (entry){
        console.log(entry);
    }

    $scope.$on('urlEntryChange', function(event, args) {
        $scope.getEntryComment();
    });
}]);
