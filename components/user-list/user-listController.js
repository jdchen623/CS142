'use strict';

cs142App.controller('UserListController', ['$scope','$resource', '$rootScope', '$route',
    function ($scope, $resource, $rootScope, $route) {
        $scope.loggedIn = false;
        $rootScope.$on('LoggedIn', function(){
            $scope.loggedIn = true;
        });
        var list;

        var doneCallback = function(model) {
            console.log(model);
            $scope.users = model;
            list = model;
        };
        var updateCallback = function(model) {
            console.log(model);
        };
/*
        var updateResource = $resource('/getActivity/:userId');
        updateResource.get(updateCallback);
*/
        //$scope.FetchModel("/user/list",doneCallback);
        $rootScope.$on('updateList', function(){
            /*
            var updateCallback = function(model) {

                console.log(model);
                $route.reload();
                $location.path("/user/list");
                console.log('reload list');
            };
*/
            var userList = $resource('/user/list');
            userList.query(doneCallback);
/*
            var updateResource = $resource('/getActivity/:userId');
            updateResource.get(updateCallback);
*/

        });
        var userList = $resource('/user/list');
        userList.query(doneCallback);
        $scope.main.title = 'Users';
        //console.log('window.cs142models.userListModel()', window.cs142models.userListModel());

        //var list = model142;
        for(var eachUser in list) {
            console.log(list[eachUser].first_name);
        }
        //$scope.users = list;



    }]);
