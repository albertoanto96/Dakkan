(function() {
    'use strict';
    var app = angular.module('mainApp');
    app.service('sellerSRV', ['$http',function ($http) {
        this.getoProfile=function(data,callback){ //cambiar
            var req = {
                method: 'POST',
                url: '/oprofile',
                headers: {'Content-Type': 'application/json'},
                data: data
            };

            $http(req).then(function (response) {
                console.log("Service: "+response.data);
                callback(response.data)
            });
        };
    }]);
})();
