app.controller('newUser', ['$scope', '$http', 'globalHelpers', '$window', function ($scope, $http, globalHelpers, $window) {
    $scope.comments = [];

    var skills = [];
    $scope.user = {
      skills: []
    };
    $scope.addUserSkills = function(){
        $scope.showWarning = false;
        if ($scope.user['skills'].length == 0) {
            $scope.showWarning = true;
            return;
        }
        $http({
            method: "post",
            url: "/new_user",
            headers: {'Content-Type': "application/json"},
            data: $scope.user
        }).success(function () {
            $window.location.href = '/';
            console.log("success!");
        });
    }

    $scope.getUserSkills = function(github_user){
        $http({
            method: "get",
            url: "https://api.github.com/users/" + github_user + "/repos",
            headers: {'Accept': 'application/json',
                      'Authorization': 'token ' + $scope.token,
                      'Content-Type': "application/json"},
        }).then(function (response) {
            data = response.data;
            for (var i=0; i < data.length; i++){
                promise = globalHelpers.getStatsPromise(data[i]["html_url"], $scope.token);
                promise.then( function(response){
                    var arr = Object.keys(response.data);
                    arr.forEach(function (element, index, array) {
                            if (skills.indexOf(element) == -1){
                                skills.push(element);
                            }
                    });
                    $scope.chunkedSkills = globalHelpers.chunk(skills, 3);
                }); 
            }
        });
    };
}]);
