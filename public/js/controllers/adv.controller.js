/**
 * Created by Adria on 14/3/17.
 */
(function() {
    'use strict';
    var app = angular.module('mainApp');
    app.controller('advCtrl', ['advSRV','$scope','$location','$rootScope','$mdDialog','$mdToast', function (advSRV,$scope,$location,$rootScope,$mdDialog,$mdToast) {

        $scope.advs=[];
        angular.element(document).ready(function () {
            advSRV.getAdvs(function (listadv) {
                $scope.advs = listadv;
            });
        });

    }]);
})();