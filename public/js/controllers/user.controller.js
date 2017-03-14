(function() {
    'use strict';
    var app = angular.module('mainApp');
    app.controller('userCtrl', ['userSRV','$scope','$location','$rootScope','$mdDialog', function (userSRV,$scope,$location,$rootScope,$mdDialog) {

        $scope.users = [];
        $scope.subjects=[];
        $scope.subjectsdb = [];
        $scope.currentNavItem = 'Anuncios';

        angular.element(document).ready(function () {
            userSRV.getSubjects(function (subjects) {
                $scope.subjectsdb = subjects;
            });
        });

        $scope.showPrompt = function(ev) {
            var confirm = $mdDialog.prompt()
                .title('¿Estás seguro de que quieres borrar tu cuenta?')
                .textContent('Te hecharemos de menos')
                .placeholder('Confirmar contraseña')
                
                .targetEvent(ev)
                .ok('Okay!')
                .cancel('Quiero seguir!');

            $mdDialog.show(confirm).then(function(result) {
                var data = {
                    name: $rootScope.name,
                    password:result
                };

                    userSRV.removeUsers(data, function (response) {
                        if(response.statusCode=200) {
                            $location.path("/");
                        }
                        else{

                        }
                    });
            });
        };
        $scope.update=function(){
            var data = {
                name: $rootScope.name,
                password:$scope.userPass,
                new:$scope.newPass
            };
            $scope.newPass="";
            $scope.userPass = "";
            userSRV.updateUser(data,function () {
            });

        };

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