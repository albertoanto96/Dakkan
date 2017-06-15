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
        this.getChat=function (data, callback) {
            var req = {
                method: 'POST',
                url: '/getChat',
                headers: {'Content-Type': 'application/json'},
                data: data
            };

            $http(req).then(function (response) {
                callback(response.data)
            });
        }
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
        this.getUserId = function (data, callback) {
            var req = {
                method: 'POST',
                url: '/getUserID',
                headers: {'Content-Type': 'application/json'},
                data: data
            };
            $http(req).then(function (response) {
                callback(response.data)
            });
        }
    }]);
})();
