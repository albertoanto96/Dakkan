var app = angular.module('myApp',['ngRoute','ngMaterial']);
app.config(['$routeProvider', function ($routeProvider) {

    $routeProvider.when('/',{
        templateUrl:'tpls/Login.html',
        controller:'mainCtrl'
    });

    $routeProvider.when('/advs',{
        templateUrl:'tpls/Main.html',
        controller:'userCtrl'
    });

    $routeProvider.when('/profile',{
        templateUrl:'tpls/Profile.html',
        controller:'profileCtrl'
    });

}]);

app.controller('mainCtrl',['$http','$rootScope','$scope','$location',function($http, $rootScope, $scope, $location)
    {
       $scope.doLogin=function() {
           $rootScope.name=$scope.uName;
           var newUser = {
           name: $scope.uName,
           password: $scope.uPass

       };
           $scope.uName="";
           $scope.uPass="";

           var req = {
               method: 'POST',
               url: '/login',
               headers: {'Content-Type': 'application/json'},
               data: newUser
           };
           $http(req).then(function (response) {
            if (angular.equals(response.data.password,newUser.password)) {
                $location.path("/advs");
            }
           });

       };
        $scope.doRegister = function(){
            $rootScope.name=$scope.uName;
            var newUser = {
                name: $scope.uName,
                password: $scope.uPass
            };
            var req = {
                method: 'POST',
                url: '/push',
                headers: {'Content-Type': 'application/json'},
                data: newUser
            };
            $http(req).then(function (response) {

                if(response.statusCode=200){
                    $location.path("/advs");
                }

            });
        };
    }]);