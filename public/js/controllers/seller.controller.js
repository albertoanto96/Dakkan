(function() {
    'use strict';
    var app = angular.module('mainApp');
    app.controller('sellerCtrl', ['sellerSRV','$scope','$location','$rootScope','$mdDialog','$mdToast','Upload', 'localStorageService',
        function (advSRV,$scope,$location,$rootScope,$mdDialog,$mdToast,Upload,localStorageService) {


        angular.element(document).ready(function () {
            data={
                name:localStorageService.get('seller')
            };
            sellerSRV.getProfile(data,function (profile) {
                $scope.image = "../img/profiles/" + profile + ".png";
            });
        });
    }]);
})();