(function () {
    'use strict';
    var app = angular.module('mainApp');

    app.controller('AppCtrl', ['$scope', '$location', '$routeParams', 'localStorageService', 'chatSRV', 'mySocket',
        function ($scope, $location, $routeParams, localStorageService, chatSRV, mySocket) {
            $scope.glued = true;
            var mensajes = [];
            var otro = "";
            var user = localStorageService.get('userName');
            $scope.user = localStorageService.get('userName');
            var params = localStorageService.get('chat');
            $scope.sellert = angular.equals(user, params.sellername);
            if (angular.equals(params.closed, true) === true) {
                console.log($scope.sellert);
                $scope.sellert = false;
            }
            var a = {
                name: user
            };
            if (user != undefined) {
                chatSRV.getownerimage(a, function (ownerimage) {
                    if (ownerimage == false) {
                        $scope.imageMe = "../imagesprof//undefined.png";
                    }
                    else {
                        $scope.imageMe = "../imagesprof//" + localStorageService.get('userID') + ".png";
                    }
                });
            }


// set-up a connection between the client and the server
            var socket = mySocket;

// let's assume that the client page, once rendered, knows what room it wants to join
            var room = params.name;
            var data = {name: room};
            chatSRV.getChat(data, function (chat) {
                for (var i = 0; i < chat.length; i++) {
                    mensajes.push(chat[i]);
                    if (chat[i].author != user) {
                        otro = chat[i].author;
                        $scope.otro = otro;
                        var b = {name: otro};
                        if (otro != undefined) {
                            chatSRV.getownerimage(b, function (ownerimage) {
                                if (ownerimage == false) {
                                    $scope.imageOtro = "../imagesprof//undefined.png";
                                }
                                else {
                                    chatSRV.getUserId(b, function (userid) {
                                        $scope.imageOtro = "../imagesprof//" + userid + ".png";
                                    })
                                }
                            });
                        }

                    } else if (otro == undefined)
                        $scope.otro = params.sellername;

                }
                $scope.messages = mensajes;
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
                    room: room
                };
                $scope.msgText = "";
                socket.emit('newmsg', payload);

            };

            $scope.treatdone = function () {
                console.log("in treatdone");
                var data = ({
                    chat: room,
                    buyer: params.buyer,
                    seller: params.sellername,
                    closed: true,
                    advid: params.advid
                });
                console.log("dataTreatdone:", data);
                chatSRV.treatdone(data, function (response) {
                    if (angular.equals(response.toString(), "ok") === true) {
                        $scope.sellert = false;
                    }
                })
            };
            $scope.$on("$destroy", function () {

            });

        }]);
})();