(function() {
    'use strict';
    var app = angular.module('mainApp');
    app.controller('userCtrl', ['userSRV','$scope','$location', function (userSRV,$scope,$location) {

        $scope.users = [];
        $scope.subjects=[];
        $scope.subjectsdb = [];
        $scope.currentNavItem = 'Anuncios';

        $scope.redirectToLogin = function(){
            $location.path("/");
        };
        $scope.redirectToProfile = function(){
            $location.path("/Perfil");
        };
        $scope.redirectToADVs = function(){
            $location.path("/Anuncios");
        };
        angular.element(document).ready(function () {
            userSRV.getSubjects(function (subjects) {
                $scope.subjectsdb = subjects;
            });
        });


        $scope.showSubjects=function(){ /////////////
            userSRV.getSubjects(function (sub) {
                $scope.subjects = sub;
            });
        };

        $scope.addToSubj=function(){ /////////////////
            var us= {
               name: $scope.userToAdd,
                subject:$scope.subjectToAdd.split("\n")[0]

        };
            userSRV.addUserToSubj(us);
            $scope.userToAdd="";
            $scope.subjectToAdd=""

        };
        $scope.usersSubj=function () {/////////////////
            var subj={
                name:$scope.usersF.split("\n")[0]
            };
            userSRV.usersFromSubj(subj,function(result){
                $scope.subjects ="";
                $scope.users=result;
            });
            $scope.usersF="";
        };


        $scope.filterdb=function(){
            userSRV.filterdb($scope.filterDB,function (users) {
                $scope.users = users;
                $scope.userName = "";
                $scope.userPass = "";
                $scope.filterDB="";

            })

        };
        $scope.showList = function() {
            userSRV.getUsers(function (users) {
                $scope.subjects ="";
                $scope.users = users;
            });
        };

        $scope.remove = function() {
            var data = {
                name: $scope.userName,
                password:$scope.userPass
            };

            userSRV.removeUsers(data,function (list) {
                $scope.userName = "";
                $scope.userPass = "";
                $scope.users = list;

            });


            /*
            var deltedUsers = [];
            angular.forEach($scope.users,function (user) {
                if(user.done){deltedUsers.push(user.name);}
            });
            userSRV.removeUsers(deltedUsers,function (list) {
                $scope.users = list;
            });
            */

        };
    }]);
})();