(function() {
    'use strict';
    var app = angular.module('mainApp');
    app.service('chatSRV', ['$http',function ($http) {
        this.treatdone=function(data,callback){
            var req = {
                method: 'POST',
                url: '/treatdone',
                headers: {'Content-Type': 'application/json'},
                data: data
            };

            $http(req).then(function (response) {
                callback(response.data)
            });
        };

    }]);
})();
