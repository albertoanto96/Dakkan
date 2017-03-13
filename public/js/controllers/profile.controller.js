 (function() {
            'use strict';
            var app = angular.module('mainApp');
            app.controller('profileCtrl', ['$rootScope','userSRV','$scope','$location', function ($rootScope,userSRV,$scope,$location) {

                $scope.currentNavItem = 'Perfil';
                $scope.redirectToProfile = function(){
                    $location.path("/Perfil");
                };
                $scope.redirectToADVs = function(){
                    $location.path("/Anuncios");
                };
                $scope.update=function(){
                    var data = {
                        name: $rootScope.name,
                        password:$scope.userPass,
                        new:$scope.newPass
                    };
                    $scope.newPass="";
                    $scope.userPass = "";
                    userSRV.updateUser(data,function (list) {
                        $scope.users=list
                    });

                };
            }]);
 })();



