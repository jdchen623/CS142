'use strict';

cs142App.controller('UserDetailController', ['$scope', '$routeParams', '$resource', '$rootScope', '$location',
  function ($scope, $routeParams, $resource, $rootScope, $location) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */

    var userId = $routeParams.userId;
    $scope.userId = userId;
    var url = "/user/"+ userId;
    console.log('UserDetail of ', userId);

    var user;
    var doneCallback = function(model) {
        /*
        $scope.$apply(function () {
            $scope.user = model;
            $scope.main.right = model.first_name +" " + model.last_name;
        });
        */
        $scope.user = model;
        $scope.main.right = model.first_name +" " + model.last_name;
        user = model;
    };
    //$scope.FetchModel(url,doneCallback);
    //$scope.user = user;
    var resource = $resource('user/:userId',{userId:userId});
    resource.get({userId:userId},doneCallback);

    $scope.mentionsOfUsers = [];

    var mentionsCallback = function(model) {
        console.log('PHOTOS OF MENTIONS',model);
        $scope.mentionsOfUsers = model;
        //$location.path(url);
    };


    var mentionResource = $resource('/mentions/:userId',{userId:userId});
    mentionResource.query({userId:userId},mentionsCallback, function errorHandling(err) {
            // Any error or non-OK status
    });

    var mostCommentsCallback = function(model) {
        $scope.mostCommentsPhoto = model.photo;
        $scope.nMostComments = model.mostComments;

        console.log('$scope.mostCommentsPhoto',model.photo);
        console.log('$scope.mostCommentsPhoto',model.mostComments);
    };
    var mostRecentCallback = function(model) {
        console.log('mostRecentCalled', model);
        $scope.mostRecentPhoto = model;

        var mostCommentsSrc = $resource('/photoMostComments/:file_name', {file_name:$scope.mostRecentPhoto.file_name});
        //var mostCommentsSrc = $resource('/photoMostComments/:photo', {photo:$scope.mostRecentPhoto});
        mostCommentsSrc.get(mostCommentsCallback);
        /*
        , function errorHandling(err){

        //mostCommentsSrc.query({'photo':$scope.mostRecentPhoto},mostCommentsCallback, function errorHandling(err){

        });
        */
    };

    $rootScope.$on( "$updateMentions", function(){
        //var mentionResource = $resource('/mentions/:userId',{userId:userId}');
        //mentionResource.query(mentionsCallback);

        var mostRecentSrc = $resource('/mostRecent/:userId',{userId:userId});
        mostRecentSrc.get(mostRecentCallback, function errorHandling(err) {
                // Any error or non-OK status
        });

    });



    var mostRecentSrc = $resource('/mostRecent/:userId',{userId:userId});
    mostRecentSrc.get(mostRecentCallback, function errorHandling(err) {
            // Any error or non-OK status
            console.log(err);
    });





  }]);
