/**
 * Created by Adria on 14/3/17.
 */
(function() {
    'use strict';
    var app = angular.module('mainApp');
    app.service('advSRV', ['$http',function ($http) {


        this.getAdvs=function(callback){ //cambiar
            $http.get('/allAdvs').then(function (response) {
                callback (response.data);
            });

        };

    }]);
})();

