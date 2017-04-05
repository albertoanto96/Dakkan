(function () {
    'use strict';
    var app = angular.module('mainApp');
    app.service('advSRV', ['$http', function ($http) {


        this.getAdvs = function (callback) { //cambiar
            $http.get('/allAdvs').then(function (response) {
                callback(response.data);
            });

        };
        this.addfavorite = function (data, callback) {

            var req = {
                method: 'POST',
                url: '/addfavorite',
                headers: {'Content-Type': 'application/json'},
                data: data
            };

            $http(req).then(function (response) {
                callback(response.data)
            });

        };

        this.addAdv = function (data, callback) {

            var req = {
                method: 'POST',
                url: '/addAdv',
                headers: {'Content-Type': 'application/json'},
                data: data
            };

            $http(req).then(function (response) {
                callback(response.data)
            });

        };

    }]);
})();

