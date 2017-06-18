(function() {
'use strict';
var app = angular.module('mainApp');
    app.controller('userCtrl',['userSRV', 'mySocket','$scope', '$location', '$rootScope', '$mdDialog', '$mdToast', 'localStorageService','$window','NgMap',
        function (userSRV, mySocket,$scope, $location, $rootScope, $mdDialog, $mdToast, localStorageService, $window, NgMap) {

            $scope.profile = null;
            $scope.users = [];
            $scope.advs = [];
            $scope.useradvs = [];
            $scope.subjects = [];
            $scope.subjectsdb = [];
            $scope.currentNavItem = 'Perfil';
            $scope.location = "";
            $scope.latlng = "";
            $scope.reviews2=[];
            $scope.chats=[];
            var geocoder = new google.maps.Geocoder();
            var originatorEv;
            var socket=mySocket;
            var estoyenchat=false;


            socket.on('connect', function () {
                 //Connected, let's sign-up for to receive messages for this room
                socket.emit('user',localStorageService.get('userName'));

            });
            socket.on("notification",function (data) {
                    var last = {
                        bottom: false,
                        top: true,
                        left: false,
                        right: true
                    };

                    $scope.toastPosition = angular.extend({}, last);

                    $scope.getToastPosition = function () {
                        sanitizePosition();

                        return Object.keys($scope.toastPosition)
                            .filter(function (pos) {
                                return $scope.toastPosition[pos];
                            })
                            .join(' ');
                    };

                    function sanitizePosition() {
                        var current = $scope.toastPosition;

                        if (current.bottom && last.top) current.top = false;
                        if (current.top && last.bottom) current.bottom = false;
                        if (current.right && last.left) current.left = false;
                        if (current.left && last.right) current.right = false;

                        last = angular.extend({}, current);
                    }

                    var pinTo = $scope.getToastPosition();
                if (estoyenchat===false) {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Nuevo mensaje de ' + data)
                            .position(pinTo)
                            .hideDelay(3000)
                    );
                }

            });
            $scope.openMenu = function($mdMenu, ev) {
                originatorEv = ev;
                $mdMenu.open(ev);
            };
            $scope.openChats = function($mdMenu, ev) {
                originatorEv = ev;
                $mdMenu.open(ev);
            };

            var getLocation = function (location) {

                var address = location
                geocoder.geocode({'address': address}, function (results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                var latitude = results[0].geometry.location.lat();
                                var longitude = results[0].geometry.location.lng();
                                var latlng = latitude + "," + longitude
                                localStorageService.set('userLatLng', latlng)
                    }
                    else {
                        localStorageService.set('userLatLng', "ERROR")
                    }
                });
            };

            var getStreet = function () {
                navigator.geolocation.getCurrentPosition(function (pos) {
                    var latlng = {lat: parseFloat(pos.coords.latitude), lng: parseFloat(pos.coords.longitude)}
                    geocoder.geocode({'location': latlng}, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            localStorageService.set('userLocationVolatile', results[0].formatted_address)
                        } else {

                        }

                    });

                })
            };


            angular.element(document).ready(function () {


                var data = {
                    name: localStorageService.get('userName')
                };
                userSRV.facebook(data,function (profile) {


                    if (profile != "noAuth") {
                        localStorageService.add('userName', profile)
                    }

                    var data = {
                        name: localStorageService.get('userName')
                    };
                    if (data.name == undefined) {
                        $location.path("/");
                        $scope.currentNavItem = 'Advs';
                    }
                    else {
                        var advs = [];
                        userSRV.getProfile(data, function (profile) {



                            localStorageService.set('userID', profile.userid)

                            if (profile.location != undefined) {

                                $scope.location = profile.location
                                localStorageService.set('userLocation', profile.location)
                                getLocation(profile.location)
                                $scope.latlng = localStorageService.get('userLatLng')
                            }
                            else {
                                $scope.latlng = "current-location"
                                getStreet()
                                $scope.location = localStorageService.get('userLocationVolatile')
                                if ($scope.location == "") {
                                    $scope.location = "Establece tu localizacion o habilita la geolocalizacion en tu buscador!"
                                }
                                else {
                                }
                            }
                            $scope.profile = localStorageService.get('userName');
                            if (profile.image != false) {
                                $scope.image = "../imagesprof//" + profile.userid + ".png";

                            }
                            else {
                                $scope.image = "../imagesprof//undefined.png";
                            }
                            if (profile.advs[0] != null) {
                                for (var i = 0; i < profile.advs.length; i++) {
                                    advs.push({
                                        id: profile.advs[i].id,
                                        title: profile.advs[i].title,
                                        description: profile.advs[i].description,
                                        exchange: profile.advs[i].exchange,
                                        owner: profile.advs[i].owner,
                                        ownername: profile.advs[i].ownername,
                                        location:profile.advs[i].location,
                                        category: profile.advs[i].category
                                    })
                                }
                            }
                            $scope.advs = advs

                        });
                        var data2={
                            id:localStorageService.get("userID")
                        };

                        userSRV.getReviews(data2,function (data) {
                            $scope.reviews=data;
                            if (data.length !=0)
                            $scope.image2="../imagesprof//" + data[0].reviewerid + ".png";
                        })

                    }
                });
                if(localStorageService.get('userName')) {
                    var nme = {
                        name: localStorageService.get('userName')
                    };
                    userSRV.getreviews(nme, function (rev) {
                        if (rev!=="") {
                            $scope.reviews2 = rev;
                        }
                    });
                }
                if(localStorageService.get('userID')) {
                    var data={
                        userid: localStorageService.get('userID')
                    };

                    userSRV.getChats(data,function (chats) {
                        $scope.chats = chats;
                    })

                }
                var data3={
                    name:localStorageService.get('userName'),
                    id:localStorageService.get("userID")
                };

                var advs=[];

                userSRV.userAdv(data3,function (profile) {


                    for(var i=0;i<profile.length;i++){
                        advs.push({
                            id: profile[i].id,
                            title: profile[i].title,
                            description: profile[i].description,
                            exchange: profile[i].exchange,
                            owner:profile[i].owner,
                            ownername:profile[i].ownername,
                            location:profile[i].location,
                            category: profile[i].category})
                    }

                    $scope.useradvs=advs

                });
            });
            $scope.chatdetail=function (chat) {
                estoyenchat=true;
                localStorageService.set('chat', chat);
                console.log("chat:", localStorageService.get('chat'));
                $location.path("/chat");
            };
            $scope.doReview=function (usr) {
                $location.path("/review").search({user:usr});
            };

            $scope.actualLocation=function () {

                $scope.latlng="current-location";
                getStreet();
                $scope.location=localStorageService.get('userLocationVolatile')

            };

            $scope.searchLocation=function () {

                if(($scope.searched!=undefined)) {
                    getLocation($scope.searched)
                    if(localStorageService.get('userLatLng')!="ERROR") {
                        $scope.latlng = localStorageService.get('userLatLng')
                        $scope.location = $scope.searched
                    }
                }


            }
            $scope.updateLocation = function (ev) {

                getLocation($scope.searched)
                if(localStorageService.get('userLatLng')!="ERROR") {


                    var confirm = $mdDialog.confirm()
                        .title('Estás seguro que quieres establecer tu ubicación en:')
                        .textContent($scope.location + '?')
                        .targetEvent(ev)
                        .ok('Estoy seguro!')
                        .cancel('Mejor en otro momento');

                    $mdDialog.show(confirm).then(function () {

                        localStorageService.set('userLocation', $scope.location)
                        var data = {
                            name: localStorageService.get('userName'),
                            location: localStorageService.get('userLocation')
                        };

                        userSRV.updateLocation(data, function (response) {
                            console.log(response)
                            $mdDialog.show(
                                $mdDialog.alert()
                                    .clickOutsideToClose(true)
                                    .title('Ubicación cambiada correctamente!')
                                    .ok('Entendido!')
                            );

                        })

                    })
                }
            };

            $scope.logoutWeb = function () {
                userSRV.logoutWeb(function () {
                    localStorageService.clearAll();
                    $scope.profile = null;
                    socket.disconnect();
                    $location.path("/");
                    location.reload();

                })

            };

            $scope.getAdv = function (adv) {

                localStorageService.add('adv', adv);
                $rootScope.adv = localStorageService.get('adv');
                $location.path("/Adv");

            };


            $scope.search = function () {

                if ($scope.search.word != undefined) {
                    userSRV.search($scope.search.word, function (response) {
                        localStorageService.add('advs', response);
                        location.reload();
                        $location.path("/Anuncios");
                    });


                } else {
                    localStorageService.add('advs', null);
                    location.reload();
                    $location.path("/Anuncios");
                }
            };

            $scope.filterdb = function () {
                userSRV.filterdb($scope.filterDB, function (users) {
                    $scope.users = users;
                    $scope.userName = "";
                    $scope.userPass = "";
                    $scope.filterDB = "";

                })

            };


            $scope.upload = function (file) {
                var data = {
                    name: localStorageService.get('userName'),
                    id: localStorageService.get('userID'),
                    file: file
                };
                userSRV.upload(data, function () {
                    console.log("IMAGEN CAMBIADA");
                    $window.location.reload();
                });
            };
            $scope.showAdvanced = function (ev) {
                $mdDialog.show({
                    templateUrl: 'tpls/dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
            };
            $scope.logout = function () {
                localStorageService.clearAll();
                $scope.profile = null;
                $location.path("/");
            };
            $scope.showPrompt = function (ev) {
                var confirm = $mdDialog.prompt()
                    .title('¿Estás seguro de que quieres borrar tu cuenta?')
                    .textContent('Te hecharemos de menos')
                    .placeholder('Confirmar contraseña')

                    .targetEvent(ev)
                    .ok('Okay!')
                    .cancel('Quiero seguir!');

                $mdDialog.show(confirm).then(function (result) {
                    var data = {
                        name: localStorageService.get('userName'),
                        password: result
                    };

                    userSRV.removeUsers(data, function (response) {
                        if (response.statusCode = 200) {
                            $scope.logout();
                            location.reload();
                            $scope.currentNavItem = 'Login';

                        }
                        else {

                        }
                    });
                });
            };
            $scope.updatePass = function (ev) {
                if ($scope.userPass == null || $scope.newPass == null || $scope.newPass2 == null) {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title('debes rellenar todos los campos!')
                            .ok('Entendido!')
                    );
                } else if ($scope.newPass == $scope.newPass2) {

                    var data = {
                        name: localStorageService.get('userName'),
                        password: $scope.userPass,
                        new: $scope.newPass
                    };

                    var confirm = $mdDialog.confirm()
                        .title('Estás seguro que quieres cambiar la contraseña?')
                        .targetEvent(ev)
                        .ok('Estoy seguro!')
                        .cancel('Mejor en otro momento');

                    $mdDialog.show(confirm).then(function () {

                        userSRV.updatePass(data, function () {
                            $mdDialog.show(
                                $mdDialog.alert()
                                    .clickOutsideToClose(true)
                                    .title('Contraseña cambiada correctamente!')
                                    .ok('Entendido!')
                            );
                            $scope.newPass = null;
                            $scope.userPass = null;
                            $scope.newName = null;
                            $scope.newPass2 = null;
                        });
                    })
                }
            }

            $scope.updateName = function (ev) {
                if ($scope.newName == null) {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title('debes introducir un nuevo nombre de usuario!')
                            .ok('Entendido!')
                    );
                } else {
                    var data = {
                        name: localStorageService.get('userName'),
                        new: $scope.newName
                    };
                    var confirm = $mdDialog.confirm()
                        .title('Estás seguro que quieres cambiar el nombre de usuario de "'
                            + localStorageService.get('userName') + '" por "' + $scope.newName + '"?')
                        .textContent(data.offer)
                        .targetEvent(ev)
                        .ok('Estoy seguro!')
                        .cancel('Mejor en otro momento');

                    $mdDialog.show(confirm).then(function () {

                        userSRV.updateName(data, function (results) {
                            if (results != "500") {
                                localStorageService.add('userName', $scope.newName)
                                $scope.profile = $scope.newName;
                                $mdDialog.show(
                                    $mdDialog.alert()
                                        .clickOutsideToClose(true)
                                        .title('Nombre de usuario modificado correctamente!')
                                        .ok('Entendido!')
                                );
                                location.reload();

                            } else {
                                $mdDialog.show(
                                    $mdDialog.alert()
                                        .clickOutsideToClose(true)
                                        .title('El nombre de usuario "' + $scope.newName + '" ya está en uso')
                                        .ok('Entendido!')
                                );
                            }
                            $scope.newPass = null;
                            $scope.userPass = null;
                            $scope.newName = null;
                            $scope.newPass2 = null;
                        });
                    });
                }
            };

            $scope.showSubjects = function () { /////////////
                userSRV.getSubjects(function (sub) {
                    $scope.subjects = sub;
                });
            };

            $scope.addToSubj = function () { /////////////////
                var us = {
                    name: $scope.userToAdd,
                    subject: $scope.subjectToAdd.split("\n")[0]

                };
                userSRV.addUserToSubj(us);
                $scope.userToAdd = "";
                $scope.subjectToAdd = ""

            };
            $scope.usersSubj = function () {/////////////////
                var subj = {
                    name: $scope.usersF.split("\n")[0]
                };
                userSRV.usersFromSubj(subj, function (result) {
                    $scope.subjects = "";
                    $scope.users = result;
                });
                $scope.usersF = "";
            };


            $scope.showList = function () {
                userSRV.getUsers(function (users) {
                    $scope.subjects = "";
                    $scope.users = users;
                });
            };
            $scope.x=function () {
                estoyenchat=false;
                $scope.currentNavItem = 'Profile';
            };
            $scope.y=function () {
                estoyenchat=false;
                $scope.currentNavItem = 'Advs';
                $location.path("/");
                setTimeout(function () {
                    location.reload();
                },100)

            };
            $scope.z=function () {
                estoyenchat=false;
                $scope.currentNavItem = 'NewAdv';
            }
        }]);
})();