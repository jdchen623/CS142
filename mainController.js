'use strict';

var cs142App = angular.module('cs142App', ['ngRoute', 'ngMaterial', 'ngResource', 'mentio']);

cs142App.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/users', {
                templateUrl: 'components/user-list/user-listTemplate.html',
                controller: 'UserListController'
            }).
            when('/users/:userId', {
                templateUrl: 'components/user-detail/user-detailTemplate.html',
                controller: 'UserDetailController'

            }).
            when('/photos/:userId', {
                templateUrl: 'components/user-photos/user-photosTemplate.html',
                controller: 'UserPhotosController'
            }).
            when('/login-register', {
                templateUrl: 'components/login-register/login-registerTemplate.html',
                controller:'LoginRegisterController'
            }).
            otherwise({
                redirectTo: '/user'
            });
    }]);

cs142App.controller('MainController', ['$scope', '$resource','$rootScope', '$location',
    function ($scope, $resource, $rootScope, $location) {
        $scope.logout = function() {
            var success = function(model) {

                console.log("logout", model);
                $scope.loggedIn = false;
                $location.path("/login-register");
                var success = function() {
                    console.log('update: photo');
                    $rootScope.$broadcast('updateList');
                };
                var updateResource = $resource('/updateActivity/');
                console.log($location);
                updateResource.save({update: "user logged out", userId: model._id}, success, function errorHandling(err) {
                        // Any error or non-OK status
                        console.log(err);
                });
            };

            var resource = $resource('/admin/logout');
            resource.save({}, success, function errorHandling(err) {});
        };

        $scope.loggedIn = false;
        $rootScope.$on('LoggedIn', function(){
            $scope.loggedIn = true;
        });

        $rootScope.$on( "$routeChangeStart", function(event, next, current) {
        if (!$scope.loggedIn) {
            // no logged user, redirect to /login-register unless already there
            if (next.templateUrl !== "components/login-register/login-registerTemplate.html") {
                $location.path("/login-register");
            }
        }
    });

        $scope.main = {};
        $scope.main.title = 'Users';
         $scope.main.version = "";
         var doneCallback = function(model) {
             /*
             $scope.$apply(function () {
                $scope.main.version = model.__v;
            });
            */
        };


         //$scope.FetchModel("/test/info", doneCallback);

         var testInfo = $resource('/test/info',{});
         testInfo.get("/test/info");


    }]);
