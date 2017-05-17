(function () {
    'use strict';
    var app = angular.module('mainApp');

    app.controller('userCtrl', ['Upload', 'userSRV', '$scope', '$location', '$rootScope', '$mdDialog', '$mdToast', 'localStorageService', '$window',
        function (Upload, userSRV, $scope, $location, $rootScope, $mdDialog, $mdToast, localStorageService, $window, NgMap) {

            $scope.profile = null;
            $scope.users = [];
            $scope.advs = [];
            $scope.subjects = [];
            $scope.subjectsdb = [];
            $scope.currentNavItem = 'Perfil';
            $scope.location = ""
            $scope.latlng = ""
            var geocoder = new google.maps.Geocoder();
            var originatorEv;

            $scope.openMenu = function($mdMenu, ev) {
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
            }


            angular.element(document).ready(function () {

                userSRV.facebook(function (profile) {


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
                                        category: profile.advs[i].category
                                    })
                                }
                            }
                            $scope.advs = advs

                        });

                    }
                });
                if(localStorageService.get('userName')) {
                    var nme = {
                        name: localStorageService.get('userName')
                    };
                    userSRV.getreviews(nme, function (rev) {
                        $scope.reviews = rev;
                    });
                }
            });

            $scope.doReview=function (usr) {
                $location.path("/review").search({user:usr});
            };

            $scope.actualLocation=function () {
                $scope.latlng="current-location"
                getStreet()
                $scope.location=localStorageService.get('userLocationVolatile')

            }

            $scope.searchLocation=function () {


                getLocation($scope.searched)
                $scope.latlng = localStorageService.get('userLatLng')
                $scope.location = $scope.searched

            }
            $scope.updateLocation = function (ev) {

                localStorageService.set('userLocation', $scope.location)

                var confirm = $mdDialog.confirm()
                    .title('Estás seguro que quieres establecer tu ubicación en:')
                    .textContent($scope.location + '?')
                    .targetEvent(ev)
                    .ok('Estoy seguro!')
                    .cancel('Mejor en otro momento');

                $mdDialog.show(confirm).then(function () {
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
            };

            $scope.logoutWeb = function () {
                userSRV.logoutWeb(function () {
                    localStorageService.clearAll();
                    $scope.profile = null;
                    $location.path("/");
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
        }]);
})();
