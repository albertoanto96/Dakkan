(function () {
    'use strict';
    var app = angular.module('mainApp');
    app.controller('advCtrl', ['advSRV', '$scope', '$location', '$rootScope', '$mdDialog', '$mdToast', 'Upload', 'localStorageService',
        function (advSRV, $scope, $location, $rootScope, $mdDialog, $mdToast, Upload, localStorageService, NgMap) {


            $scope.googleMapsUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAU-CXgmB-8XZnXFwyq3gOdpKINaSRxW3k?libraries=places"
            $scope.category = "Todo";
            $scope.dist = "Toda España!";
            $scope.totaladv = [];
            $scope.reladv = [];
            $scope.boton = false;
            $scope.advs = [];
            $scope.user = localStorageService.get('userID');
            $scope.currentNavItem = 'Anuncios';
            $scope.classes = [{"title": "Todo"}, {"title": "Deportes"}, {"title": "Hogar"}, {"title": "Ocio"}, {"title": "Salud"}];
            $scope.distances = [{"distance": "1km"}, {"distance": "5km"}, {"distance": "15km"}, {"distance": "25km"}, {"distance": "Toda España!"}];
            var geocoder = new google.maps.Geocoder();

            var getLocation = function (location) {
                var address = location;
                geocoder.geocode({'address': address}, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var latitude = results[0].geometry.location.lat();
                        var longitude = results[0].geometry.location.lng();
                        $scope.location = latitude + "," + longitude

                    }
                    else {

                    }
                });
            };
            var getLoc = function (location) {
                var address = location;
                var latlng = [];
                var i = 0;
                for (i; i < address.length; i++) {
                    geocoder.geocode({'address': address[i].location}, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            var latitude = results[0].geometry.location.lat();
                            var longitude = results[0].geometry.location.lng();
                            latlng.push({lat: latitude, lng: longitude});
                            localStorageService.set('advLatLngVolatile', latlng)

                        }
                        else {

                        }
                    });
                }
            };
            var getLatLng = function () {
                navigator.geolocation.getCurrentPosition(function (pos) {
                    var latlng = {lat: parseFloat(pos.coords.latitude), lng: parseFloat(pos.coords.longitude)}
                    localStorageService.set('userLatLngVolatile', latlng)
                })
            }

            var dateFromObjectId = function (objectId) {
                var date = new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
                var then = moment(date).utc().format("DD/MM/YYYY HH:mm:ss");
                var now = moment().local().utc().format("DD/MM/YYYY HH:mm:ss");
                var ms = moment(now, "DD/MM/YYYY HH:mm:ss").diff(moment(then, "DD/MM/YYYY HH:mm:ss"));
                var d = moment.duration(ms);
                var minutes = Math.floor(d.asMinutes())
                var hours = Math.floor(d.asHours())
                var days = Math.floor(d.asDays())
                if (minutes <= 1) {
                    return "Justo ahora"
                }
                if (minutes <= 60) {
                    return minutes + " minutos"
                }
                if (hours >= 24) {
                    return days + " dias"
                }
                if (hours <= 24) {
                    return hours + " horas"
                }
            };

            if (localStorageService.get('adv') != null) {

                $scope.dateuser = dateFromObjectId(localStorageService.get('adv').owner)
                $scope.dateadv = dateFromObjectId(localStorageService.get('adv').id)
                getLocation(localStorageService.get('adv').location)
            }

            angular.element(document).ready(function () {


                setTimeout(function () {
                    if($scope.totaladv){
                        getLoc($scope.totaladv)
                    }
                },2000)

                getLatLng()

                if (localStorageService.get('advs') == null) {
                    advSRV.getAdvs(function (listadv) {
                        $scope.totaladv = listadv;
                        $scope.boton = false;
                        $scope.advs = listadv;
                        $rootScope.adv = localStorageService.get('adv');
                    });
                }
                else {
                    $scope.boton = true;
                    $scope.totaladv = localStorageService.get('advs')
                    $scope.advs = localStorageService.get('advs');
                    $rootScope.adv = localStorageService.get('adv');
                }

                if (localStorageService.get('adv')) {
                    if (localStorageService.get('adv').ownername !== null) {
                        var data = {
                            name: localStorageService.get('adv').ownername
                        };
                    }
                }
                if (data) {
                    if (data.name != undefined) {
                        advSRV.getownerimage(data, function (ownerimage) {
                            if (ownerimage == false) {
                                $scope.image = "../imagesprof//undefined.png";
                            }
                            else {
                                $scope.image = "../imagesprof//" + localStorageService.get('adv').owner + ".png";
                            }
                        });
                    }
                }
            });

            $scope.isFavorite = function () {
                $scope.fav = false;
                if (localStorageService.get('adv')) {
                    var data = {
                        name: localStorageService.get('userName'),
                        advid: localStorageService.get('adv').id
                    };
                    advSRV.isfavorite(data, function (response) {
                        if (response.length != 0) {
                            $scope.fav = true;
                        } else
                            $scope.fav = false;
                        console.log("$scope.fav:", $scope.fav);
                    })
                }
            };

            $scope.isFavorite();

            $scope.favorite = function (ev) {

                var confirm = $mdDialog.confirm()
                    .title('Estás seguro que quieres añadir de favoritos este anuncio?')
                    .targetEvent(ev)
                    .ok('Estoy seguro!')
                    .cancel('No, dejalo');

                $mdDialog.show(confirm).then(function () {

                    var data = {
                        name: localStorageService.get('userName'),
                        advid: $rootScope.adv.id
                    };
                    advSRV.addfavorite(data, function (response) {

                    })
                    $location.path("/Perfil")
                });
            };

            $scope.resetAdv = function () {
                localStorageService.add('advs', null);
                location.reload()
            };

            $scope.unfavorite = function (ev) {

                var confirm = $mdDialog.confirm()
                    .title('Estás seguro que quieres quitar de favoritos este anuncio?')
                    .targetEvent(ev)
                    .ok('Estoy seguro!')
                    .cancel('No, dejalo');

                $mdDialog.show(confirm).then(function () {

                    var data = {
                        name: localStorageService.get('userName'),
                        advid: $rootScope.adv.id
                    };
                    advSRV.deletefavorite(data, function (response) {

                    })
                    $location.path("/Perfil")
                });

            };

            $scope.delete = function (ev) {

                var confirm = $mdDialog.confirm()
                    .title('Estás seguro que quieres borrar este anuncio?')
                    .targetEvent(ev)
                    .ok('Estoy seguro!')
                    .cancel('No, dejalo');

                $mdDialog.show(confirm).then(function () {

                    var data = {
                        userid: localStorageService.get('userID'),
                        advid: $rootScope.adv.id
                    };
                    advSRV.deleteadv(data, function (response) {

                    });
                    $location.path("/Profile");
                });

            };

            $scope.resetAdv = function () {
                localStorageService.add('advs', null)
                location.reload()
            }

            $scope.emailuser = function (ev) {

                $mdDialog.show({
                    templateUrl: 'tpls/emailuser.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
            };
            $scope.doOffer = function (ev) {
                var data = {
                    advid: localStorageService.get('adv').id,
                    userid: localStorageService.get('userID'),
                    sellerid: localStorageService.get('adv').owner,
                    advurl: localStorageService.get('adv').imageurl,
                    sellername: localStorageService.get('adv').ownername,
                    buyer: localStorageService.get('userName'),
                    advname: localStorageService.get('adv').title,
                    offer: $scope.offer
                };


                if (localStorageService.get('userName') == data.sellername) {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title('No puedes hacerte una oferta a ti mismo!')
                            .ok('Entendido!')
                    );
                } else if (data.offer == undefined) {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title('Tienes que introducir una oferta!')
                            .ok('Entendido!')
                    );
                } else {
                    var confirm = $mdDialog.confirm()
                        .title('Estás seguro que quieres enviar esta oferta?')
                        .textContent(data.offer)
                        .targetEvent(ev)
                        .ok('Estoy seguro!')
                        .cancel('Mejor en otro momento');

                    $mdDialog.show(confirm).then(function () {
                        advSRV.sendOffer(data, function (response) {
                            if (response == "500") {
                                $mdDialog.show(
                                    $mdDialog.alert()
                                        .clickOutsideToClose(true)
                                        .title('Ya has enviado una oferta a este anuncio')
                                        .ok('Entendido!')
                                );
                            } else {
                                $mdDialog.show(
                                    $mdDialog.alert()
                                        .clickOutsideToClose(true)
                                        .title('Oferta enviada!')
                                        .ok('Entendido!')
                                );
                                $scope.currentNavItem = 'Anuncios';
                                $location.path("/Anuncios");
                            }
                        });
                    });

                }
            }
            var rad = function (x) {
                return x * Math.PI / 180;
            };

            var getDistance = function (p1, p2) {
                var R = 6378137; // Earth’s mean radius in meter
                var dLat = rad(p2.lat - p1.lat);
                var dLong = rad(p2.lng - p1.lng);
                var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
                    Math.sin(dLong / 2) * Math.sin(dLong / 2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                var d = R * c;
                return d; // returns the distance in meter
            };

            $scope.distanceAdv = function (d) {

                if(d!=undefined){
                    $scope.dist=d.distance
                }
                $scope.categoryAdv();
                return $scope.dist

            };

            $scope.categoryAdv = function (c) {
                if(c!=undefined) {
                    $scope.category = c.title
                }
                $scope.advs = $scope.totaladv
                var catadv = [];
                var advlatlng
                var userlatlng = localStorageService.get('userLatLngVolatile')
                var dist = 0
                var i = 0;
                advlatlng = localStorageService.get('advLatLngVolatile')
                if ($scope.totaladv.length == 0) {
                    return $scope.category
                }

                for (i; i < advlatlng.length; i++) {

                    dist = getDistance(userlatlng, advlatlng[i])



                    if (($scope.dist == "1km") && (dist < 1000)) {
                        catadv.push($scope.advs[i])
                    }
                    if (($scope.dist == "5km") && (dist < 5000)) {
                        catadv.push($scope.advs[i])
                    }
                    if (($scope.dist == "15km") && (dist < 15000)) {
                        catadv.push($scope.advs[i])
                    }
                    if (($scope.dist == "25km") && (dist < 25000)) {
                        catadv.push($scope.advs[i])
                    }
                    if ($scope.dist == "Toda España!") {
                        catadv.push($scope.advs[i])
                    }
                }
                    $scope.advs = catadv
                    catadv = []
                    i = 0

                    for (i; i < $scope.advs.length; i++) {

                        if ($scope.category == "Todo") {

                            catadv.push($scope.advs[i])
                        }
                        else if (($scope.advs[i].category == $scope.category) || ($scope.advs[i].category == "Todo")) {
                            catadv.push($scope.advs[i])
                        }
                    }
                    $scope.advs = catadv;
                    return $scope.category
            }


            $scope.getAdv = function (adv) {
                localStorageService.add('adv', adv);
                $rootScope.adv = localStorageService.get('adv');

                $location.path("/Adv");

            };
            $scope.profile = function () {
                localStorageService.add('seller', $scope.adv.ownername);
                $location.path("/oProfile");
            };
            $scope.upload = function (file) {
                var data = {
                    name: localStorageService.get('userName'),
                    file: file
                };
                userSRV.upload(data, function () {
                    $window.location.reload();
                });
            };
            $scope.addNewAdv = function (ev) {
                var data = {
                    title: $scope.tittle,
                    description: $scope.productDesc,
                    exchange: $scope.productInterest,
                    active: true,
                    category: $scope.category,
                    location: localStorageService.get("userLocation"),
                    owner: localStorageService.get('userID')
                };
                if (localStorageService.get('userID') == null) {
                    $location.path("/");
                    $scope.currentNavItem = 'Advs';
                    $mdDialog.show(
                        $mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title('Registrate primero para poder subir tu anuncio.')
                            .ok('Entendido!')
                    );
                }
                else {
                    if (data.title == null || data.description == null || data.exchange == null) {
                        $mdDialog.show(
                            $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title('Hay que rellenar todos los campos!')
                                .ok('Entendido!')
                        );
                    }
                    if (localStorageService.get("userLocation") == null) {

                        $mdDialog.show(
                            $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title('Establece la localizacion en tu perfil!')
                                .ok('Entendido!')
                        );
                    }
                    else {
                        var confirm = $mdDialog.confirm()
                            .title('Estás seguro que quieres publicar este anuncio?')
                            .targetEvent(ev)
                            .ok('Estoy seguro!')
                            .cancel('Mejor en otro momento');

                        $mdDialog.show(confirm).then(function () {
                            advSRV.addAdv(data, function (response) {
                                if (response == "500") {
                                    $mdDialog.show(
                                        $mdDialog.alert()
                                            .clickOutsideToClose(true)
                                            .title('Ya existe un anuncio con ese título')
                                            .ok('Entendido!')
                                    );
                                } else {
                                    var data2 = {
                                        name: localStorageService.get('userID') + "-" + $scope.tittle,
                                        file: $scope.file
                                    };
                                    $scope.tittle = "";
                                    if ($scope.form.file.$valid && $scope.file) {
                                        advSRV.upload(data2);
                                    }
                                    $mdDialog.show(
                                        $mdDialog.alert()
                                            .clickOutsideToClose(true)
                                            .title('Anuncio publicado.')
                                            .ok('Entendido!')
                                    );
                                    $scope.currentNavItem = 'Anuncios';
                                    advSRV.getAdvs(function (listadv) {
                                        $scope.totaladv = listadv;
                                        $scope.advs = listadv;
                                        $rootScope.adv = localStorageService.get('adv');
                                    });
                                    $location.path("/Anuncios");
                                }
                            })
                        });
                    }
                }
            };

            $scope.cancelAdv = function (ev) {
                var confirm = $mdDialog.confirm()
                    .title('Estás seguro que quieres descartar este anuncio?')
                    .targetEvent(ev)
                    .ok('Estoy seguro!')
                    .cancel('No, quiero seguir');

                $mdDialog.show(confirm).then(function () {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title('Anuncio descartado.')
                            .ok('Entendido!')
                    );
                    $scope.currentNavItem = 'Anuncios';
                    $location.path("/Anuncios");
                });
            }

        }]);
})();
