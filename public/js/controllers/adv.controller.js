(function () {
    'use strict';
    var app = angular.module('mainApp');
    app.controller('advCtrl', ['advSRV', '$scope', '$location', '$rootScope', '$mdDialog', '$mdToast', 'Upload', 'localStorageService',
        function (advSRV, $scope, $location, $rootScope, $mdDialog, $mdToast, Upload, localStorageService) {

            $scope.category = "Todo";
            $scope.totaladv = [];
            $scope.advs = [];
            $scope.image = "../img/anun1.jpg";
            $scope.currentNavItem = 'Anuncios';
            $scope.classes = [{"title": "Todo"}, {"title": "Deportes"}, {"title": "Hogar"}, {"title": "Ocio"}, {"title": "Salud"}];

            angular.element(document).ready(function () {
                if ($rootScope.advs == null) {
                    advSRV.getAdvs(function (listadv) {
                        $scope.totaladv = listadv;
                        $scope.advs = listadv;
                        $rootScope.adv = localStorageService.get('adv');
                    });
                }
                else {
                    $scope.advs = $rootScope.advs;
                    $rootScope.adv = localStorageService.get('adv');
                    console.log($scope.advs)
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
                if (data.owner == null) {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title('Registrate primero para poder subir tu anuncio.')
                            .ok('Entendido!')
                    );
                    $location.path("/Anuncios");
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
                                        name:localStorageService.get('userName')+"-"+$scope.tittle,
                                        file : $scope.file
                                    };
                                    $scope.tittle="";
                                    if ($scope.form.file.$valid && $scope.file) {
                                        advSRV.upload(data2);
                                    }
                                    $scope.status = 'Anuncio publicado.';
                                    console.log("status: " + $scope.status);
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
                    $scope.status = 'Anuncio descartado.';
                    $scope.currentNavItem = 'Anuncios';
                    $location.path("/Anuncios");
                });
            }

        }]);
})();