(function() {
    'use strict';
    var app = angular.module('mainApp');
    app.controller('userCtrl', ['Upload','userSRV','$scope','$location','$rootScope','$mdDialog','$mdToast','localStorageService','$window',
        function (Upload,userSRV,$scope,$location,$rootScope,$mdDialog,$mdToast,localStorageService,$window) {

            $scope.profile="";
            $scope.users = [];
            $scope.advs = [];
            $scope.subjects=[];
            $scope.subjectsdb = [];
            $scope.currentNavItem = 'Perfil';

            angular.element(document).ready(function () {
                var data = {
                    name:  localStorageService.get('userName')
                };
                if(data.name == null){
                    $location.path("/");
                    $scope.currentNavItem = 'Anuncios';

                }
                else{
                    var advs=[];
                    userSRV.getProfile(data,function (profile) {


                        $scope.profile=profile.userid;
                        if(profile.image!=false){
                        $scope.image = "../img/profiles/" + profile.userid + ".png";

                        }
                        else{
                           $scope.image = "../img/profiles/undefined.png";
                        }
                        for(var i=0;i<profile.advs[0].length;i++){
                            advs.push({
                                id: profile.advs[0][i]._id,
                                title: profile.advs[0][i].title,
                                description: profile.advs[0][i].description,
                                exchange: profile.advs[0][i].exchange,
                                owner:profile.advs[0][i].owner._id,
                                ownername:profile.advs[0][i].owner.name,
                                category: profile.advs[0][i].category})
                        }

                        $scope.advs=advs

                    });
                }

            });

            $scope.getAdv = function (adv) {

                localStorageService.add('adv', adv);
                $rootScope.adv = localStorageService.get('adv');
                $location.path("/Adv");

            };


            $scope.search=function () {

                if($scope.search.word!=undefined){
                    userSRV.search($scope.search.word, function (response) {
                        localStorageService.add('advs', response);
                    })
                }else{
                    localStorageService.add('advs', null)
                }
                location.reload()
                $location.path("/Anuncios");
            };

            $scope.filterdb=function(){
                userSRV.filterdb($scope.filterDB,function (users) {
                    $scope.users = users;
                    $scope.userName = "";
                    $scope.userPass = "";
                    $scope.filterDB="";

                })

            };

            $scope.upload = function (file) {
                var data= {
                    id:localStorageService.get('userID'),
                    file : file
                };
                userSRV.upload(data,function () {
                    $window.location.reload();
                });
            };
            $scope.showAdvanced = function(ev) {
                $mdDialog.show({
                    templateUrl: 'tpls/dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true
                })
            };
            $scope.logout=function () {
                localStorageService.clearAll();
                $location.path("/");
            };
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
                        name: localStorageService.get('userName'),
                        password:result
                    };

                    userSRV.removeUsers(data, function (response) {
                        if(response.statusCode=200) {
                            $location.path("/");
                            $scope.currentNavItem = 'Login';
                            localStorageService.clearAll();
                        }
                        else{

                        }
                    });
                });
            };
            $scope.updatePass=function(){
                if($scope.newPass==$scope.newPass2) {
                    var data = {
                        name: localStorageService.get('userName'),
                        password: $scope.userPass,
                        new: $scope.newPass
                    };

                    userSRV.updatePass(data, function () {
                    });
                }
                $scope.newPass="";
                $scope.userPass = "";
                $scope.newName="";
                $scope.newPass2="";

            };
            $scope.updateName=function(){
                var data = {
                    name:localStorageService.get('userName'),
                    new:$scope.newName
                };

                userSRV.updateName(data,function (results) {

                    if(results!="500") {
                        localStorageService.add('userName',$scope.newName)
                    }else{
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent($scope.newName+" ya esta en uso")
                                .position("bottom")
                                .hideDelay(3000)
                        );
                    }
                    $scope.newPass="";
                    $scope.userPass = "";
                    $scope.newName="";
                    $scope.newPass2="";

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


            $scope.showList = function() {
                userSRV.getUsers(function (users) {
                    $scope.subjects ="";
                    $scope.users = users;
                });
            };
        }]);
})();