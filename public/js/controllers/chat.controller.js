var app = angular.module('mainApp');

app.controller('AppCtrl', function ($scope,$location,localStorageService) {
    $scope.glued = true;
    var mensajes=[];
    var params = $location.search();
// set-up a connection between the client and the server
    var socket = io.connect('http://147.83.7.156:3000');

// let's assume that the client page, once rendered, knows what room it wants to join
    var room = params.chat.name;
    var user=localStorageService.get('userName');
    for(i=0;i<params.chat.chats.length;i++){
        mensajes.push(params.chat.chats[i]);
    }
    $scope.messages=mensajes;


    socket.on('connect', function () {
        // Connected, let's sign-up for to receive messages for this room
        socket.emit('room', room);

    });

    socket.on('messages', function (data) {
        $scope.$apply(function () {
            mensajes.push(data);
            $scope.messages = mensajes;
        });
    });
    $scope.addMessage = function () {
        var payload = {
            author: user,
            text: $scope.msgText
        };

        $scope.msgText = "";
        socket.emit('newmsg', payload);
    }

});