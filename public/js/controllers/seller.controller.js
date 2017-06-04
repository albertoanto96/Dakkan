(function() {
    'use strict';
    var app = angular.module('mainApp');
    app.controller('sellerCtrl', ['sellerSRV','$scope','$location','$rootScope','$mdDialog','$mdToast','Upload', 'localStorageService',
        function (sellerSRV,$scope,$location,$rootScope,$mdDialog,$mdToast,Upload,localStorageService) {

            $scope.profile=""
            $scope.name
            $scope.advs=[]
            $scope.location=""
            $scope.reviews="";

            var geocoder = new google.maps.Geocoder();

            var getLocation =function(location) {

                var address = location;
                geocoder.geocode({ 'address': address }, function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        var latitude = results[0].geometry.location.lat();
                        var longitude = results[0].geometry.location.lng();
                        var latlng =latitude+","+longitude;
                        localStorageService.set('userLatLngVolatile',latlng)
                    }
                    else {

                    }
                });
            };

            angular.element(document).ready(function () {

                $scope.name=localStorageService.get('seller');
                var data={
                    name:localStorageService.get('seller'),
                    id:localStorageService.get("adv").owner
                };

                sellerSRV.getoProfile(data,function (profile) {
                    $scope.profile = profile;
                    getLocation(profile.location);
                    $scope.location=localStorageService.get('userLatLngVolatile');
                    console.log($scope.location);

                    if (profile.image == false) {
                        $scope.image = "../imagesprof//undefined.png";
                    }
                    else {
                        $scope.image = "../imagesprof//"+localStorageService.get('adv').owner+".png";
                    }

                })
                var advs=[]

                sellerSRV.getoAdv(data,function (profile) {

                    $scope.profile=profile

                    for(var i=0;i<profile.length;i++){
                        advs.push({
                            id: profile[i].id,
                            title: profile[i].title,
                            description: profile[i].description,
                            exchange: profile[i].exchange,
                            owner:profile[i].owner,
                            ownername:profile[i].ownername,
                            category: profile[i].category})
                    }

                    $scope.advs=advs

                });

                $scope.getAdv = function (adv) {

                    localStorageService.add('adv', adv);
                    $rootScope.adv = localStorageService.get('adv');
                    $location.path("/Adv");
                };
                var data2={
                    id:localStorageService.get("adv").owner
                };

                sellerSRV.getReviews(data2,function (data) {
                    $scope.reviews=data;
                    //if (data.length !=0)
                    //$scope.image2="../imagesprof//" + data[0].reviewerid + ".png";
                })

            });
        }]);
})();