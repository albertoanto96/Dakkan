var app = angular.module('mainApp',['ngRoute','ngMaterial','ngFileUpload','LocalStorageModule']);
app.config(['$routeProvider', function ($routeProvider) {

    $routeProvider.when('/',{
        templateUrl:'tpls/main.html',
        controller:'userCtrl'
    });
    $routeProvider.when('/Anuncios',{
        templateUrl:'tpls/main.html',
        controller:'userCtrl'
    });
    $routeProvider.when('/Perfil',{
        templateUrl:'tpls/profile.html',
        controller:'userCtrl'
    });
    $routeProvider.when('/Advs',{
        templateUrl:'tpls/advs.html',
        controller:'advCtrl'
    });
    $routeProvider.when('/Adv',{
        templateUrl:'tpls/adv.html',
        controller:'advCtrl'
    });
    $routeProvider.when('/oProfile',{
        templateUrl:'tpls/oProfile.html',
        controller:'userCtrl'
    });



}]);

app.controller('mainCtrl',['$http','$rootScope','$scope','$location','$mdDialog','localStorageService',function($http, $rootScope, $scope, $location,$mdDialog,localStorageService)
    {
        $scope.currentNavItem = 'Login';



$scope.doLogin=function() {

           localStorageService.add('userName',$scope.userName)
           var newUser = {
           name: $scope.userName,
           password: $scope.userPass

       };
           $scope.userName="";
           $scope.userPass="";

           var req = {
               method: 'POST',
               url: '/login',
               headers: {'Content-Type': 'application/json'},
               data: newUser
           };
           $http(req).then(function (response) {
            if (angular.equals(response.data.name,newUser.name)) {
                $scope.currentNavItem = 'Anuncios';
                $mdDialog.hide();
                $location.path("/Anuncios");
                $scope.currentNavItem = 'Anuncios';
            }
           });

       };
        $scope.doRegister = function(){
            $rootScope.name=$scope.userName;
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
                if
                (response.statusCode=200){
                    localStorageService.add('userName',$scope.userName)
                    $scope.currentNavItem = 'Anuncios';
                    $mdDialog.hide();
                    $location.path("/Anuncios");

                }

            });
        };
    }]);