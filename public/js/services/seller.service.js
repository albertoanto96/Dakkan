(function() {
    'use strict';
    var app = angular.module('mainApp');
    app.service('sellerSRV', ['$http',function ($http) {
        this.getoProfile=function(data,callback){ //cambiar
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

        this.getoAdv=function(data,callback){ //cambiar
            var req = {
                method: 'POST',
                url: '/userAdvs',
                headers: {'Content-Type': 'application/json'},
                data: data
            };
            $http(req).then(function (response) {
                callback(response.data)
            });
        };
        this.getReviews=function (data, callback) {
            var req={
                method:'POST',
                url:'/getreviews',
                headers: {'Content-Type': 'application/json'},
                data: data
            };
            $http(req).then(function (response) {
                callback(response.data)
            });
        }

    }]);
})();
