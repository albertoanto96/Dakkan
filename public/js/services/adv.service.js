/**
 * Created by Adria on 14/3/17.
 */
(function() {
    'use strict';
    var app = angular.module('mainApp');
    app.service('advSRV', ['$http','Upload',function ($http,Upload) {


        this.getAdvs=function(callback){ //cambiar
            $http.get('/allAdvs').then(function (response) {
                callback (response.data);
            });

        };

        this.uploadFile=function(data,callback){

            Upload.upload({
                method: 'POST',
                url: '/upload',
                data: data
            }).then(function (resp) {
                console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            });
        };

    }]);
})();

