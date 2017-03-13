(function() {
    'use strict';
    var app = angular.module('myApp');
    app.service('userSRV', ['$http',function ($http) {


        this.usersFromSubj=function(subject,callback){ //cambiar
            var req = {
                method: 'POST',
                url: '/userssubj',
                headers: {'Content-Type': 'application/json'},
                data: subject

            };

            $http(req).then(function (response) {
                    callback(response.data)
            });

        };

        this.addUserToSubj=function(u){ //cambiar
            var req = {
                method: 'PUT',
                url: '/updsub',
                headers: {'Content-Type': 'application/json'},
                data: u
            };
            $http(req).then(function (response) {
            });


        };
        this.getUsers = function (callback) {

            $http.get('/all').then(function (response) {
                callback (response.data);
            });

        };

        this.getSubjects=function(callback){ //////////cambiar
            $http.get('/subjects').then(function (response) {
                callback (response.data);
            });

        };
        this.removeUsers = function (data,callback) {
            var req = {
                method: 'DELETE',
                url: '/delete',
                headers: {'Content-Type': 'application/json'},
                data: data
            };
            $http(req).then(function (response) {

                callback(response.data)

            });
        };
        this.filterdb =function (data,callback) {

            var req = {
                method: 'GET',
                data: data,
                url: '/filterdb/'+data,
                headers: {'Content-Type': 'application/json'}

            };

             $http(req).then(function (response) {

              callback(response.data)

             });
        };
        this.updateUser=function(data,callback){
            var req = {
                method: 'PUT',
                url: '/update',
                headers: {'Content-Type': 'application/json'},
                data: data
            };
            $http(req).then(function (response) {
                callback(response.data)
            });
        }
    }]);
})();