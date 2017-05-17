(function () {
    'use strict';
    var app = angular.module('mainApp');
    app.controller('advCtrl', ['advSRV', '$scope', '$location', '$rootScope', '$mdDialog', '$mdToast', 'Upload', 'localStorageService',
        function (advSRV, $scope, $location, $rootScope, $mdDialog, $mdToast, Upload, localStorageService,NgMap) {


            $scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyAU-CXgmB-8XZnXFwyq3gOdpKINaSRxW3k?libraries=places"
            $scope.category = "Todo";
            $scope.totaladv = [];
             $scope.boton = false;
            $scope.advs = [];
            $scope.currentNavItem = 'Anuncios';
            $scope.classes = [{"title": "Todo"}, {"title": "Deportes"}, {"title": "Hogar"}, {"title": "Ocio"}, {"title": "Salud"}];
            console.log("se carga")

            var getLocation =function(location) {
                var geocoder = new google.maps.Geocoder();
                var address = location;
                geocoder.geocode({ 'address': address }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var latitude = results[0].geometry.location.lat();
                        var longitude = results[0].geometry.location.lng();
                        $scope.location=latitude+","+longitude

                    }
                    else {

                    }
                });
            };

            var dateFromObjectId = function (objectId) {
                var date =new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
                var then= moment(date).utc().format("DD/MM/YYYY HH:mm:ss");
                var now=moment().local().utc().format("DD/MM/YYYY HH:mm:ss");
                var ms = moment(now,"DD/MM/YYYY HH:mm:ss").diff(moment(then,"DD/MM/YYYY HH:mm:ss"));
                var d = moment.duration(ms);
                var minutes=Math.floor(d.asMinutes())
                var hours = Math.floor(d.asHours())
                var days= Math.floor(d.asDays())
                if(minutes<=1){
                    return "Justo ahora"
                }
                if(minutes<=60){
                    return minutes+ " minutos"
                }
                if(hours>=24){
                    return days + " dias"
                }
                if(hours<=24)
                {
                    return hours + " horas"
                }
            };

            if(localStorageService.get('adv')!= null){

            $scope.dateuser=dateFromObjectId(localStorageService.get('adv').owner)
            $scope.dateadv=dateFromObjectId(localStorageService.get('adv').id)
            getLocation(localStorageService.get('adv').location)
            }

            angular.element(document).ready(function () {


                if (localStorageService.get('advs')==null) {
                    advSRV.getAdvs(function (listadv) {
                        $scope.totaladv = listadv;
		             	$scope.boton = false;
                        $scope.advs = listadv;
                        $rootScope.adv = localStorageService.get('adv');
                    });
                }
                else {
                    $scope.boton = true;
                    $scope.totaladv=localStorageService.get('advs')
                    $scope.advs = localStorageService.get('advs');
                    $rootScope.adv = localStorageService.get('adv');
                }

                if(localStorageService.get('adv')) {
                    if (localStorageService.get('adv').ownername !== null) {
                        var data = {
                            name: localStorageService.get('adv').ownername
                        };
                    }
                }
                if(data.name!=null) {
                    advSRV.getownerimage(data, function (ownerimage) {
                        if (ownerimage == false) {
                            $scope.image = "../imagesprof//undefined.png";
                        }
                        else {
                            $scope.image = "../imagesprof//" + localStorageService.get('adv').owner + ".png";
                        }
                    });
                }
            });

            $scope.favorite = function () {
                var data = {
                    name: localStorageService.get('userName'),
                    advid: $rootScope.adv.id
                };
                advSRV.addfavorite(data, function (response) {

                })
            };
            $scope.resetAdv=function () {
                localStorageService.add('advs',null);
                location.reload()
            };
            $scope.unfavorite = function () {
                var data = {
                    name: localStorageService.get('userName'),
                    advid: $rootScope.adv.id
                };
                advSRV.deletefavorite(data, function (response) {

                });
                $location.path("/Profile");
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

            $scope.resetAdv=function () {
                localStorageService.add('advs',null)
                location.reload()
            }

            $scope.emailuser = function (ev) {

                $mdDialog.show({
                    templateUrl: 'tpls/emailuser.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true
                })
            };
            $scope.doOffer=function (ev) {
                var data = {
                    advid: localStorageService.get('adv').id,
                    userid: localStorageService.get('userID'),
                    sellerid: localStorageService.get('adv').owner,
                    sellername:localStorageService.get('adv').ownername,
                    username:localStorageService.get('userName'),
                    advname:localStorageService.get('adv').title,
                    offer: $scope.offer
                };


                if (localStorageService.get('userName') == data.sellername) {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title('No puedes hacerte una oferta a ti mismo!')
                            .ok('Entendido!')
                    );
                }else if (data.offer == undefined) {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title('Tienes que introducir una oferta!')
                            .ok('Entendido!')
                    );
                }else {
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
                            }else{
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

            $scope.categoryAdv = function () {

                $scope.advs = $scope.totaladv;

                if ($scope.category != "Todo") {
                    var catadv = [];
                    var i = 0;
                    for (i; i < $scope.advs.length; i++) {
                        if ($scope.advs[i].category == $scope.category) {
                            catadv.push($scope.advs[i])
                        }
                    }
                    $scope.advs = catadv;

                }

                return $scope.category

            };

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
                var data= {
                    name:localStorageService.get('userName'),
                    file : file
                };
                userSRV.upload(data,function () {
                    $window.location.reload();
                });
            };
            $scope.addNewAdv = function (ev) {
                var data = {
                    title: $scope.tittle,
                    description: $scope.productDesc,
                    exchange: $scope.productInterest,
                    category: $scope.category,
                    location:localStorageService.get("userLocation"),
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
                else{
                    if (data.title == null || data.description == null || data.exchange == null) {
                        $mdDialog.show(
                            $mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title('Hay que rellenar todos los campos!')
                                .ok('Entendido!')
                        );
                    }
                    console.log(localStorageService.get("userLocation"))
                    if(localStorageService.get("userLocation")==null){

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
                                    var data2= {
                                        name:localStorageService.get('userID')+"-"+$scope.tittle,
                                        file : $scope.file
                                    };
                                    $scope.tittle="";
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
