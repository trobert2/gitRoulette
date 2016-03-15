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
    
    getUrlLanguagesPromise : function(gitUrlId){
        var promise = $http({
            method: "get",
            url: "/get_url_languages/" + gitUrlId,
            headers: {'Accept': 'application/json',
                      'Content-Type': "application/json"},
        })
        return promise; 
    },

    }
    return my;
}]);
