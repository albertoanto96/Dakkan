(function() {
    'use strict';
    var app = angular.module('mainApp');
    app.controller('advCtrl', ['advSRV','$scope','$location','$rootScope','$mdDialog','$mdToast','Upload','localStorageService',
        function (advSRV,$scope,$location,$rootScope,$mdDialog,$mdToast,Upload,localStorageService) {

        $scope.advs=[];

        angular.element(document).ready(function () {
            if(localStorageService.get('advs')==null) {
                advSRV.getAdvs(function (listadv) {
                    $scope.advs = listadv;
                    $rootScope.adv = localStorageService.get('adv');
                });
            }
            else{
                $scope.advs=localStorageService.get('advs');
                $rootScope.adv = localStorageService.get('adv');
                console.log($scope.advs)
            }
        });

        $scope.getAdv=function(adv){
            $location.path("/Adv");
            if(localStorageService.get('adv')==null) {
                localStorageService.add('adv', adv);
            }
            $rootScope.adv=localStorageService.get('adv');


        };
        $scope.profile=function(){
            localStorageService.add('seller',$scope.adv.owner);
            $location.path("/oProfile")
        }
    }]);
})();