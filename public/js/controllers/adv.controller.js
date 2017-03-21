(function() {
    'use strict';
    var app = angular.module('mainApp');
    app.controller('advCtrl', ['advSRV','$scope','$location','$rootScope','$mdDialog','$mdToast','Upload','localStorageService',
        function (advSRV,$scope,$location,$rootScope,$mdDialog,$mdToast,Upload,localStorageService) {

        $scope.totaladv=[];
        $scope.advs=[];
        $scope.classes = [{"title":"Deportes"}, {"title":"Hogar"}, {"title":"Ocio"},{"title":"Salud"}];

        angular.element(document).ready(function () {
            if($rootScope.advs==null) {
                advSRV.getAdvs(function (listadv) {

                    $scope.totaladv=listadv;
                    $scope.advs = listadv;
                    $rootScope.adv = localStorageService.get('adv');
                });
            }
            else{
                $scope.advs=$rootScope.advs;
                $rootScope.adv = localStorageService.get('adv');
                console.log($scope.advs)
            }
        });
        $scope.categoryAdv=function () {

            $scope.advs=$scope.totaladv
            var catadv=[];
            var i=0;
            for(i;i<$scope.advs.length;i++){
            if($scope.advs[i].category==$scope.category){

                catadv.push($scope.advs[i])
            }
                }

                $scope.advs=catadv
        };

        $scope.getAdv=function(adv){
            $location.path("/Adv");
                localStorageService.add('adv', adv);

            $rootScope.adv=localStorageService.get('adv');


        };
        $scope.profile=function(){
            localStorageService.add('seller',$scope.adv.owner);
            $location.path("/oProfile")
        }
    }]);
})();