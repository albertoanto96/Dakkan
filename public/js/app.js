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


    $scope.doLogin = function () {
        location.reload();
        localStorageService.add('userName', $scope.userName)
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
            localStorageService.add('userID', response.data._id);
            if (angular.equals(response.data.name, newUser.name)) {
                $scope.currentNavItem = 'Anuncios';
                $mdDialog.hide();
                $location.path("/Anuncios");
                $scope.currentNavItem = 'Anuncios';
            }
        });

    };
    $scope.doRegister = function () {
        location.reload();
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
                localStorageService.add('userID', response.data[0]._id);
                localStorageService.add('userName', $scope.userName);
                $scope.currentNavItem = 'Anuncios';
                $mdDialog.hide();
                $location.path("/Anuncios");
            }
        });
    };
}]);