app.controller('reviewsReceived', ['$scope', '$http', 'globalHelpers', function ($scope, $http, globalHelpers) {

    $scope.getEntryComment = function(){
        $scope.comments = {};
        //FIXME: We use pathArray[2] too much. replace with variable!
        //FIXME: check if adding a parameter is worth doing and not get all entries.
        //FIXME: this is crap. restructure all of it. I was drunk. sorry!
        //for (var i=0; i < $scope.existing.length; i++){
        $scope.existing.forEach(function(element){
            var _url = globalHelpers.getLocation(element["url"]);
            var pathArray = _url.pathname.split('/');
            if (pathArray[3] == "pull"){
                pathArray[3] = "issue";
            }
            if(Object.keys($scope.comments).indexOf() < 0){
                $scope.comments[pathArray[2]] = {}; 
            }

            $http({
                method: "get",
                url: "https://api.github.com/repos/" + pathArray[1] + "/" + pathArray[2] + "/" + pathArray[3] + "s/" + pathArray[4] + "/comments",
                headers: {'Accept': 'application/json',
                          'Authorization': 'token ' + $scope.token,
                          'Content-Type': "application/json"},
            }).success(function (response) {
                var c = [];
                for (var i=0; i < response.length; i++){
                    // Date.parse(response[i]["created_at"]) >= Date.parse(element['element_time'])) add later on to show onlyreviews after post
                        // TODO: we need to add a reference to each element to show next to the post to see which is which. 
                        // It's good that we group them by project, but we can't tell which so called 'url' is which
                    c.push(response[i])
                }
                $scope.comments[pathArray[2]][element.name] = c;
                console.log("here:", $scope.comments);
            });
        });
    };

    $scope.add_something = function (github_user, comment_id){
        console.log(github_user);
        console.log(comment_id);
        var obj = JSON.parse('{"github_user": "' + github_user  + '", "comment_id": "' + comment_id + '"}');
        $http({
            method: "post",
            url: "/add_something",
            headers: {'Accept': 'application/json',
                      'Content-Type': "application/json"},
            data: obj
        }).success(function (response) {
            // console.log(response);
        });
    }

    $scope.noThanks = function (element){
        console.log(element);
    }

    $scope.$on('urlelementChange', function(event, args) {
        $scope.getelementComment();
    });
}]);
