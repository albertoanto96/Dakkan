(function () {
    'use strict';
    var app = angular.module('mainApp');
    app.service('advSRV', ['$http','Upload',function ($http,Upload) {


        this.getAdvs = function (callback) { //cambiar
            $http.get('/allAdvs').then(function (response) {
                callback(response.data);
            });

        };
        this.getownerimage = function (data,callback) {
            var req = {
                method: 'POST',
                url: '/getOwnerImage',
                headers: {'Content-Type': 'application/json'},
                data: data
            };
            $http(req).then(function (response) {
                callback(response.data)
            });

        };
        this.upload=function (data,callback) {
            Upload.upload({
                url: 'uploadadv/',
                data: data
            }).then(function (resp) {
            }, function (resp) {
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            });
        };

        this.isfavorite = function (data, callback) {
            var req = {
                method: 'POST',
                url: '/isfavorite',
                headers: {'Content-Type': 'application/json'},
                data: data
            };
            $http(req).then(function (response) {
                callback(response.data)
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
        this.deletefavorite = function (data, callback) {

            var req = {
                method: 'POST',
                url: '/deletefavorite',
                headers: {'Content-Type': 'application/json'},
                data: data
            };

            $http(req).then(function (response) {
                callback(response.data)
            });

        };

        this.deleteadv = function (data, callback) {

            var req = {
                method: 'POST',
                url: '/deleteadv',
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

        this.sendOffer = function (data, callback) {

            var req = {
                method: 'POST',
                url: '/sendOffer',
                headers: {'Content-Type': 'application/json'},
                data: data
            };

            $http(req).then(function (response) {
                callback(response.data)
            });
        };

    }]);
})();

