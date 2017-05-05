var app = angular.module('mainApp', ['ngRoute', 'ngMaterial', 'ngFileUpload', 'LocalStorageModule']);

app.config(['$routeProvider', function ($routeProvider) {

    $routeProvider.when('/Anuncios', {
        templateUrl: 'tpls/advs.html',
        controller: 'advCtrl'
    });
    $routeProvider.when('/Perfil', {
        templateUrl: 'tpls/profile.html',
        controller: 'userCtrl'
    });
    $routeProvider.when('/Adv', {
        templateUrl: 'tpls/adv.html',
        controller: 'advCtrl'
    });
    $routeProvider.when('/oProfile', {
        templateUrl: 'tpls/oProfile.html',
        controller: 'sellerCtrl'
    });
    $routeProvider.when('/NewAdv', {
        templateUrl: 'tpls/newAdv.html',
        controller: 'advCtrl'
    });
    $routeProvider.otherwise({redirectTo: '/Anuncios'})


}]);

app.controller('mainCtrl', ['$http', '$rootScope', '$scope', '$location', '$mdDialog', 'localStorageService', function ($http, $rootScope, $scope, $location, $mdDialog, localStorageService) {
    $scope.currentNavItem = 'Login';

    $scope.localLogin=function () {

        var user = {
            name: $scope.userName,
            password: $scope.userPass
        };
        $scope.userName = "";
        $scope.userPass = "";

        var req = {
            method: 'POST',
            url: '/auth/local',
            headers: {'Content-Type': 'application/json'},
            data: user
        };
        $http(req).then(function (response) {console.log(response)})

    }

    $scope.facebookLogin=function () {

        var req = {

            method: 'POST',
            url: '/auth/facebook',
            headers: {'Content-Type': 'application/json'},
        };
        $http(req).then(function (response) {console.log(response)})

    }

    $scope.doLogin = function () {
        localStorageService.add('userName', $scope.userName);
        var newUser = {
            name: $scope.userName,
            password: $scope.userPass
        };
        $scope.userName = "";
        $scope.userPass = "";

        var req = {
            method: 'POST',
            url: '/login',
            headers: {'Content-Type': 'application/json'},
            data: newUser
        };
        $http(req).then(function (response) {
            localStorageService.set('userID', response.data[0]._id);
            if (angular.equals(response.data[0].name, newUser.name)) {
                $scope.currentNavItem = 'Advs';
                $mdDialog.hide();
                $location.path("/Anuncios");
            }
            location.reload();
        });
    };
    $scope.doRegister = function () {
        var newUser = {
            name: $scope.userName,
            password: $scope.userPass
        };
        var req = {
            method: 'POST',
            url: '/push',
            headers: {'Content-Type': 'application/json'},
            data: newUser
        };
        $http(req).then(function (response) {
            if (response.statusCode = 200) {
                localStorageService.set('userID', response.data._id);
                localStorageService.set('userName', $scope.userName);
                $scope.currentNavItem = 'Advs';
                $mdDialog.hide();
                $location.path("/Anuncios");
                location.reload();
            }
            else{
                location.reload();
                $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('Imposible registrarse.')
                    .ok('Entendido!')
            }
        });
    };
}]);
