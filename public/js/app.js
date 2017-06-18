'use strict';
var app = angular.module('mainApp',
    ['ngRoute', 'ngMaterial', 'ngFileUpload', 'LocalStorageModule','btford.socket-io','luegg.directives','ngMap'])
    .
    factory('mySocket',['socketFactory', function (socketFactory) {

        return socketFactory({
            prefix: '',
            ioSocket: io.connect('http://147.83.7.156:3000')
            //ioSocket: io.connect('http://localhost:3000')
        });

    }]);

app.config(['$routeProvider', function ($routeProvider) {

    $routeProvider.
    when('/', {
        templateUrl: 'tpls/advs.html',
        controller: 'advCtrl'
    }).when('/Anuncios', {
        templateUrl: 'tpls/advs.html',
        controller: 'advCtrl'
    }).when('/Perfil', {
        templateUrl: 'tpls/profile.html',
        controller: 'userCtrl'
    }).when('/Adv', {
        templateUrl: 'tpls/adv.html',
        controller: 'advCtrl'
    }).when('/oProfile', {
        templateUrl: 'tpls/oProfile.html',
        controller: 'sellerCtrl'
    }).when('/NewAdv', {
        templateUrl: 'tpls/newAdv.html',
        controller: 'advCtrl'
    }).when('/chat',{
        templateUrl:'tpls/chat.html',
        controller:'AppCtrl'
    }).when('/chats',{
        templateUrl:'tpls/chats.html',
        controller:'chatsCtrl'
    }).when('/review',{
        templateUrl:'tpls/review.html',
        controller:'revCtrl'
    })
        .otherwise({redirectTo: '/Anuncios'})


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
                location.reload();
            }
             else {
                $mdDialog.show(
                    $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title('Nombre de usuario y/o contraseña incorrectos.')
                        .ok('Entendido!')
                );
                localStorageService.clearAll();
            }
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

            if (response === "500") {
                $mdDialog.alert()
                .clickOutsideToClose(true)
                .title('Imposible registrarse.')
                .ok('Entendido!');
                localStorageService.clearAll();

            }
            else{
                localStorageService.set('userID', response.data._id);
                localStorageService.set('userName', $scope.userName);
                $scope.doLogin();
                $mdDialog.hide();
            }

        });
    };
}]);
