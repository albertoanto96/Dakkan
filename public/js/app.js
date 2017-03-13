var app = angular.module('mainApp',['ngRoute','ngMaterial']);
app.config(['$routeProvider', function ($routeProvider) {

    $routeProvider.when('/',{
        templateUrl:'tpls/main.html',
        controller:'mainCtrl'
    });

    $routeProvider.when('/Anuncios',{
        templateUrl:'tpls/main.html',
        controller:'userCtrl'
    });
    $routeProvider.when('/Perfil',{
        templateUrl:'tpls/profile.html',
        controller:'profileCtrl'
    });
    $routeProvider.when('/Login',{
        templateUrl:'tpls/login.html',
        controller:'profileCtrl'
    });


}]);

app.controller('mainCtrl',['$http','$rootScope','$scope','$location',function($http, $rootScope, $scope, $location)
    {
       $scope.doLogin=function() {
           $rootScope.name=$scope.userName;
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
            if (angular.equals(response.data.password,newUser.password)) {
                $location.path("/Anuncios");
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

                if(response.statusCode=200){
                    $location.path("/Anuncios");
                }

            });
        };
    }]);