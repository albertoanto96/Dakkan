 (function() {
            'use strict';
            var app = angular.module('myApp');
            app.controller('profileCtrl', ['$rootScope','userSRV','$scope','$location', function ($rootScope,userSRV,$scope,$location) {

                $scope.currentNavItem = 'Profile';
                $scope.redirectToProfile = function(){
                    $location.path("/profile");
                };
                $scope.redirectToADVs = function(){
                    $location.path("/advs");
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



