(function() {
    'use strict';
    var app = angular.module('mainApp');
    app.service('chatsSRV', ['$http',function ($http) {
        this.getChats=function(data,callback){ //cambiar
            var req = {
                method: 'POST',
                url: '/rooms',
                headers: {'Content-Type': 'application/json'},
                data: data
            };

            $http(req).then(function (response) {
                callback(response.data)
            });
        };

    }]);
})();
