(function() {
    'use strict';
    var app = angular.module('mainApp');
    app.controller('chatsCtrl', ['chatsSRV','$scope','$location','$rootScope','$mdDialog','$mdToast','Upload', 'localStorageService',
        function (chatsSRV,$scope,$location,$rootScope,$mdDialog,$mdToast,Upload,localStorageService) {

            $scope.chats=[];

            angular.element(document).ready(function () {

                var data={
                    userid: localStorageService.get('userID')
                };

                chatsSRV.getChats(data,function (chats) {
                    $scope.chats = chats;
                })

            });

            $scope.chatdetail=function (chat) {
                $location.path("/chat").search({chat:chat});


            }
        }]);
})();
