'strict';

cs142App.controller('LoginRegisterController', ['$scope', '$routeParams', '$resource', '$http', '$rootScope', '$location',

    function($scope, $routeParams, $resource, $http, $rootScope, $location) {

        var clearFields = function() {
            $scope.newPassword1 = "";
            $scope.newPassword2 = "";
            $scope.newUserName = "";
            $scope.newDescription = "";
            $scope.newOccupation = "";
            $scope.newFirstName = "";
            $scope.newLastName = "";
            $scope.main.errorMessage = "";
        };
        $scope.newUserName = "";
        $scope.newFirstName = "";
        $scope.newLastName = "";
        $scope.valid = false;
        $scope.passwordsMatch = true;
        $scope.userNameFree = false;

        $scope.main.errorMessage = "";

        $scope.addNewUser = function() {

            var newUserCallback = function (model) {
                $rootScope.$broadcast('updateList');
                $scope.main.errorMessage = "SUCCESS";
                console.log('SUCCESS!');
            };

            if($scope.newPassword1 !== $scope.newPassword2) {
                $scope.passwordsMatch = false;
                clearFields();
                $scope.main.errorMessage = "passwords don't match";
                return;
            }
            if($scope.newUserName === "") {
                clearFields();
                $scope.main.errorMessage = "username empty";
                return;
            }
            if($scope.newFirstName === "") {
                clearFields();
                $scope.main.errorMessage = "first name field empty";
                return;
            }
            if($scope.newLastName === "") {
                    clearFields();
                    $scope.main.errorMessage = "last name field empty";
                    return;
            }
            console.log("click");
            var resource = $resource('user');

            resource.save({'login_name':$scope.newUserName, 'first_name': $scope.newFirstName, 'last_name': $scope.newLastName, 'location': $scope.newLocation, 'description': $scope.newDescription, 'password': $scope.newPassword1}, newUserCallback, function errorHandling(err) {
                    $scope.main.errorMessage = err.data;
            });
        };

        var success = function(model) {

            $scope.main.currentUser = model.first_name;
            $rootScope.$broadcast('LoggedIn');
            var url = "/users/" + model._id;
            var success = function() {
                console.log('update: photo');
                $rootScope.$broadcast('updateList');
            };
            var updateResource = $resource('/updateActivity/');
            updateResource.save({update: "user logged in", userId: model._id}, success, function errorHandling(err) {
                    // Any error or non-OK status
                    console.log(err);
            });
            console.log(url);
            $location.path(url);
        };
        $scope.submit = function() {
            if ($scope.user_name && $scope.password) {
                var resource = $resource('/admin/login');
                //console.log(resource.save({'login_name':$scope.user_name}))
                resource.save({'login_name': $scope.user_name, 'password': $scope.password}, success, function errorHandling(err) {
                        // Any error or non-OK status
                        $scope.valid = true;
                });
                $scope.user_name = '';

            }
        };
        console.log($scope.user_name);
    }

]);
