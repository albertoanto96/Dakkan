(function() {
    'use strict';
    var app = angular.module('mainApp');
    app.controller('sellerCtrl', ['sellerSRV','$scope','$location','$rootScope','$mdDialog','$mdToast','Upload', 'localStorageService',
        function (sellerSRV,$scope,$location,$rootScope,$mdDialog,$mdToast,Upload,localStorageService) {

        angular.element(document).ready(function () {
            var data={
                name:localStorageService.get('seller')
            };
            sellerSRV.getoProfile(data,function (profile) {
                $scope.image = "../img/profiles/" + profile + ".png";
            });
        });
    }]);
})();