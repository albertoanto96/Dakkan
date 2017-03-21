(function() {
    'use strict';
    var app = angular.module('mainApp');
    app.service('sellerSRV', ['$http',function ($http) {
        this.getProfile=function(data,callback){ //cambiar
            var req = {
                method: 'POST',
                url: '/profile',
                headers: {'Content-Type': 'application/json'},
                data: data
            };
            $http(req).then(function (response) {
                callback(response.data)
            });
        };
    }]);
})();
