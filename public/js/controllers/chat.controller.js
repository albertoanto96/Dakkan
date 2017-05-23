(function() {
'use strict';
var app = angular.module('mainApp');

app.controller('AppCtrl',['$scope','$location','localStorageService','chatSRV','mySocket',
    function ($scope,$location,localStorageService,chatSRV,mySocket) {
    $scope.glued = true;
    var mensajes=[];
    var user=localStorageService.get('userName');
    var params = $location.search();
    $scope.sellert=angular.equals(user,params.chat.sellername);
    if(angular.equals(params.chat.closed,true)===true){
        $scope.sellert=false;
    }
// set-up a connection between the client and the server
    var socket=mySocket;

// let's assume that the client page, once rendered, knows what room it wants to join
    var room = params.chat.name;
    var data={name:room};
    chatSRV.getChat(data,function (chat) {
        console.log(chat);
        for(var i=0;i<chat.length;i++){
            mensajes.push(chat[i]);
        }
        $scope.messages=mensajes;
    });


    //socket.on('connect', function () {
        // Connected, let's sign-up for to receive messages for this room
        //socket.emit('user',user);
        socket.emit('room', room);
    //});

    socket.on('messages', function (data) {
        $scope.$apply(function () {
            mensajes.push(data);
            $scope.messages = mensajes;
        });
    });
    $scope.addMessage = function () {
        var payload = {
            author: user,
            text: $scope.msgText,
            room:room
        };
        $scope.msgText = "";
        socket.emit('newmsg', payload);

    };

    $scope.treatdone=function () {
        var data=({
            chat:room,
            buyer:params.chat.buyer,
            seller:params.chat.sellername,
            closed:true
        });
        chatSRV.treatdone(data,function (response) {
        if(angular.equals(response.toString(),"ok")===true){
        $scope.sellert=false;
        }
        })
    };
        $scope.$on("$destroy", function(){

        });

}]);
})();