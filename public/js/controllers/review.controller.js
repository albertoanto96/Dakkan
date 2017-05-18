var app = angular.module('mainApp');

app.controller('revCtrl', function ($scope,$location,localStorageService,$http,$mdDialog) {

    var user=localStorageService.get('userName');
    var params = $location.search();
    var rating;
    $scope.sendR=function () {
        if(angular.equals($scope.rating,undefined)===true){
            rating=0;
        }
        else{
            rating=$scope.rating;
        }
        var data={
            title:$scope.title,
            description:$scope.description,
            rating:rating,
            reviewername:user,
            reviewerid:localStorageService.get('userID'),
            usrname:params.user
        };

        var req = {
            method: 'POST',
            url: '/postreview',
            headers: {'Content-Type': 'application/json'},
            data: data
        };

        $http(req).then(function (data) {
            if(angular.equals(data.data,"ok")===true){
                $mdDialog.show(
                    $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title('Has opinado sobre este usuario')
                        .ok('Excelente')
                );
                $location.path('/Anuncios')
            }

        });
    }

});
