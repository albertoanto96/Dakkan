(function () {
    'use strict';
    var app = angular.module('mainApp');
    app.controller('advCtrl', ['advSRV', '$scope', '$location', '$rootScope', '$mdDialog', '$mdToast', 'Upload', 'localStorageService',
        function (advSRV, $scope, $location, $rootScope, $mdDialog, $mdToast, Upload, localStorageService) {

            $scope.category = "Todo";
            $scope.totaladv = [];
            $scope.advs = [];
            $scope.currentNavItem = 'Anuncios';
            $scope.classes = [{"title": "Todo"}, {"title": "Deportes"}, {"title": "Hogar"}, {"title": "Ocio"}, {"title": "Salud"}];


            var dateFromObjectId = function (objectId) {
                return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
            };
            if(localStorageService.get('avd')!= null){
            $scope.dateuser=dateFromObjectId(localStorageService.get('adv').owner)
            $scope.dateadv=dateFromObjectId(localStorageService.get('adv').id)
            }

            angular.element(document).ready(function () {
                if (localStorageService.get('advs') == null) {
                    advSRV.getAdvs(function (listadv) {
                        $scope.totaladv = listadv;
                        $scope.advs = listadv;
                        $rootScope.adv = localStorageService.get('adv');
                    });
                }
                else {
                    $scope.totaladv=localStorageService.get('advs');
                    $scope.advs = localStorageService.get('advs');
                    $rootScope.adv = localStorageService.get('adv');
                }
                var data = {
                    name: localStorageService.get('adv').ownername
                };


                advSRV.getownerimage(data,function (ownerimage) {
                    if(ownerimage==false){
                        $scope.image = "../imagesprof//undefined.png";
                    }
                    else{
                        $scope.image = "../imagesprof//"+localStorageService.get('adv').owner+".png";
                    }
                });
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
                    sellername: localStorageService.get('adv').ownername,
                    offer: $scope.offer
                }

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
                    } else {
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