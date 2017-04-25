(function() {
    'use strict';
    var app = angular.module('mainApp');
    app.controller('sellerCtrl', ['sellerSRV','$scope','$location','$rootScope','$mdDialog','$mdToast','Upload', 'localStorageService',
        function (sellerSRV,$scope,$location,$rootScope,$mdDialog,$mdToast,Upload,localStorageService) {

            $scope.profile=""
            $scope.name
            $scope.advs=[]

            angular.element(document).ready(function () {

                $scope.name=localStorageService.get('seller')
                var data={
                    name:localStorageService.get('seller'),
                    id:localStorageService.get("adv").owner
                };

                sellerSRV.getoProfile(data,function (profile) {
                    $scope.profile = profile

                    if (profile.image == false) {
                        $scope.image = "../img/profiles/undefined.png";
                    }
                    else {
                        $scope.image = "../img/profiles/"+localStorageService.get('adv').owner+".png";
                    }

                })
                var advs=[]

                sellerSRV.getoAdv(data,function (profile) {

                    $scope.profile=profile
                    for(var i=0;i<profile.length;i++){
                        advs.push({
                            id: profile[i].id,
                            title: profile[i].title,
                            description: profile[i].description,
                            exchange: profile[i].exchange,
                            owner:profile[i].owner,
                            ownername:profile[i].ownername,
                            category: profile[i].category})
                    }

                    $scope.advs=advs

                });

                $scope.getAdv = function (adv) {

                    localStorageService.add('adv', adv);
                    $rootScope.adv = localStorageService.get('adv');
                    $location.path("/Adv");
                };

            });
        }]);
})();