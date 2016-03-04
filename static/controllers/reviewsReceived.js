app.controller('reviewsReceived', ['$scope', '$http', 'globalHelpers', function ($scope, $http, globalHelpers) {

    $scope.getEntryComment = function(){
        $scope.comments = {};
        //FIXME: check if adding a parameter is worth doing and not get all entries.
        $scope.existing.forEach(function(element){
            var _url = globalHelpers.getLocation(element["url"]);
            var pathArray = _url.pathname.split('/');
            github_user = pathArray[1];
            project = pathArray[2];
            entry_type = pathArray[3];
            entry_id = pathArray[4];

            if (entry_type == "pull"){
                entry_type = "issue";
            }
            if(Object.keys($scope.comments).indexOf() < 0){
                $scope.comments[project] = {}; 
            }

            $http({
                method: "get",
                url: "https://api.github.com/repos/" + github_user + "/" + project + "/" + entry_type + "s/" + entry_id + "/comments",
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
                $scope.comments[project][element.name] = c;
            });
        });
    };

    $scope.add_something = function (github_user, comment_id){
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
