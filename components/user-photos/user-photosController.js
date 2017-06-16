'use strict';



cs142App.controller('UserPhotosController', ['$scope', '$routeParams', '$resource', '$location', '$http','mentioUtil', '$rootScope',
  function($scope, $routeParams, $resource, $location, $http, mentioUtil, $rootScope) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */

     $scope.people = [
    { label: 'Joe'},
    { label: 'Mike'},
    { label: 'Diane'}
    ];
     $scope.vm = {};
   $scope.vm.note = '';

   $scope.vm.people = [{label: 'StevenSpielburg'}, {label: 'GeorgeLucas'}, {label: 'RonHoward'}];
   $scope.tags = [];





     var userListCallback = function(model) {
         console.log(model);
         //model = JSON.stringify(model);

         $scope.userList = model;
     };

     $scope.$on('updateList', function(){
         var userList = $resource('/user/list');
         $scope.userList.query(userListCallback);
     });

     $scope.userList = $resource('/user/list');
     $scope.userList.query(userListCallback);


     var userId = $routeParams.userId;
     $scope.newComment = "";

    var url = "/photosOfUser/" + userId;
    var userUrl = "/user/" + userId;
    var photosUrl = "/photos/" + userId;
    var doneCallback;
    doneCallback = function(model) {

        $scope.photos = model;
    };
    var userCallback = function(model) {
        console.log(model.first_name);
        $scope.main.right = model.first_name +" " + model.last_name + "'s Photos";
    };
    //$scope.FetchModel(url,doneCallback);
    //$scope.FetchModel(userUrl, userCallback);

    var user = $resource('user/:userId', {userId:userId});
    user.get({userId:userId},userCallback);
    var photos = $resource('/photosOfUser/:userId', {userId: userId});
    photos.query({userId:userId}, doneCallback);

    console.log('UserPhoto of ', $routeParams.userId);

    console.log($scope.newComment);

    $scope.addNewComment = function(newComment, eachPhoto) {
        console.log("addComment", newComment);
        var success = function() {
            var url = '/photos/' + userId;
            photos.query({userId:userId}, doneCallback);
            $scope.newComment = "";

            var successUpdate = function() {
                console.log('update: photo');
                $rootScope.$broadcast('updateList');
            };
            var updateResource = $resource('/updateActivity/');
            console.log($location);
            updateResource.save({update: "added a comment", userId: userId}, successUpdate, function errorHandling(err) {
                    // Any error or non-OK status
                    console.log(err);
            });
        };
        console.log(eachPhoto);
        $scope.newComment = newComment;
        var resource = $resource('/commentsOfPhoto/:photo_id', {photo_id: eachPhoto._id});
        console.log('RESOURCE',resource);
        resource.save({'comment':$scope.newComment}, success, function errorHandling(err) {
                // Any error or non-OK status
        });

        var successMention = function () {
            $scope.taggedId = "";
            console.log('SUCCESS MENTION');
        };
        console.log('$scope.eachPhotoFile_name', $scope.eachPhotoFile_name);
        console.log('$scope.taggedId',$scope.taggedId);

        if($scope.taggedId !== "" || $scope.taggedId !== null ) {
            console.log($scope.eachPhotoFile_name);
            console.log('taggedId',$scope.taggedId );
            var mentionsResource = $resource('mentions/new');
            mentionsResource.save({file_name: $scope.eachPhotoFile_name, _id: $scope.taggedId}, successMention,function errorHandling(err) {
                // Any error or non-OK status
                console.log(err);
            });

        }

    };

var selectedPhotoFile;   // Holds the last file selected by the user

// Called on file selection - we simply save a reference to the file in selectedPhotoFile
$scope.inputFileNameChanged = function (element) {
    var success = function() {
        console.log('update: photo');
        $rootScope.$broadcast('updateList');
    };
    console.log('selectedFile');
    selectedPhotoFile = element.files[0];
    $scope.uploadPhoto();

    var updateResource = $resource('/updateActivity/');
    updateResource.save({update: "posted a photo", userId: userId}, success, function errorHandling(err) {
            // Any error or non-OK status
            console.log(err);
    });
    console.log('update: photo');
    $rootScope.$broadcast('updateList');


};

// Has the user selected a file?
$scope.inputFileNameSelected = function () {
    console.log('SELECTEDFILE?');
    return !!selectedPhotoFile;
};

// Upload the photo file selected by the user using a post request to the URL /photos/new
$scope.uploadPhoto = function () {
    console.log('UPLOADED');
    if (!$scope.inputFileNameSelected()) {
        console.error("uploadPhoto called will no selected file");
        return;
    }
    console.log('fileSubmitted', selectedPhotoFile);

    // Create a DOM form and add the file to it under the name uploadedphoto
    var domForm = new FormData();
    domForm.append('uploadedphoto', selectedPhotoFile);

    // Using $http to POST the form
    $http.post('/photos/new', domForm, {
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
    }).then(function successCallback(response){
        // The photo was successfully uploaded. XXX - Do whatever you want on success.
        console.log('SUCCESS');
        var url = '/photos/' + userId;
        photos.query({userId:userId}, doneCallback);
        $scope.newComment = "";
        $location.path(photosUrl);
    }, function errorCallback(response){
        // Couldn't upload the photo. XXX  - Do whatever you want on failure.
        console.error('ERROR uploading photo', response);
    });

};

/*
$scope.getAtUsers = function(term) {
    var atUsersList = [];
    var atListCallback = function (model) {
        model = JSON.stringify(model);
        $scope.userList = model;
        var tagsList = [];
        angular.forEach($scope.userList, function(item) {
            if (item.id.toUpperCase().indexOf(term.toUpperCase()) >= 0) {
                if (tagsList.length <= 5) {
                    tagsList.push(item);
                }
            }
        });

     $scope.tags = tagsList;
     $scope.allTagsList = tagsList;
     return tagsList;

    };

    $scope.userList = $resource('/user/list');
    $scope.userList.query(atListCallback);
};

*/

$scope.taggedId = "";

$scope.getTagTextRaw = function(item) {
        console.log('item',item);
        //return '<i class="mention-tag-text" style="color:#a52a2a;">' + item.fullName + '</i>';
        //document.getElementById("textSlot").innerHTML = "test";
        $scope.taggedId = item._id;

        return item.fullName;
};

  $scope.searchTags = function(term) {
    var tagsList = [];
    /*
    angular.forEach($scope.allTagList, function(item) {
      if (item.id.toUpperCase().indexOf(term.toUpperCase()) >= 0) {
        if (tagsList.length <= 5) {
          tagsList.push(item);
        }
      }
    });
    */
    console.log($scope.userList);
    var userList = [];
    userList = $scope.userList;
    var nUsers = userList.length;
    console.log('nUsers', nUsers);
    angular.forEach(userList, function(item) {

        var fullName = item.first_name + " " + item.last_name;
        console.log(fullName);
      if (fullName.toUpperCase().indexOf(term.toUpperCase()) >= 0) {
        if (tagsList.length <= 5) {
          item.fullName = fullName;
          tagsList.push(item);
        }
      }
    });


    $scope.tags = tagsList;
    return tagsList;
  };
      //$scope.allTagsList = $scope.userList;


      $scope.allTagList = [{
        "id": "ctp",
        "name": "#ctp"
      }, {
        "id": "earningRelease",
        "name": "#earningRelease"
      }, {
        "id": "presssrelease",
        "name": "#presssrelease"
      }, {
        "id": "inversor-conference",
        "name": "#inversor-conference"
      }, {
        "id": "live release",
        "name": "#IACLive"
      }, {
        "id": "reval",
        "name": "#reval"
      }, {
        "id": "margin",
        "name": "#margin"
      }, {
        "id": "phonecall",
        "name": "#phonecall"
      }, {
        "id": "Q4",
        "name": "#Q4"
      }];

      $scope.tinyMceOptions = {
        init_instance_callback: function(editor) {
          $scope.iframeElement = editor.iframeElement;
        },
        resize: false,
        width: '100%',
        height: 150,
        plugins: 'print textcolor',
        toolbar: "bold italic underline strikethrough| undo redo",
        toolbar_items_size: 'small',
        menubar: false,
        statusbar: false
      };

      $scope.printLink = function() {
          console.log("lajksdfaksjdf");
      };
      $scope.eachPhotoFile_name = "";

      $scope.getId = function(eachPhoto) {

          console.log("getID");
          console.log('eachPhoto.date_time',eachPhoto);
          var id = eachPhoto.file_name;
          $scope.eachPhotoFile_name = id;

          /*
          var mentionsResource = $resource('mentions/new');
          mentionsResource.save({file_name: eachPhoto.file_name}, success,function errorHandling(err) {
                  // Any error or non-OK status
          });
          */

          console.log('ID',id);
          return id;
      };


  }]);
