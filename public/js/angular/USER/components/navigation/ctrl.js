app.controller("NavCtrl", function($window, $location, $scope, $mdSidenav, $mdMedia, $timeout, logoutService, UserInfo) {
    console.log('User Navigation Controller');

    // $scope.showSidenav = $mdMedia('gt-md')
    // this.currUser = UserInfo.user
    $scope.currUser = UserInfo;
    // $scope.currUser = function() {
    //     var user = UserInfo.getUser();
    //     console.log("user:", user)
    //     return user;
    //     // return UserInfo.getUser();
    // } 

    $scope.showSidenav = false

    $scope.openSidenav = function() {
        $scope.showSidenav = !$scope.showSidenav
    }

    $scope.logout = function(){
        logoutService.logout(function(data) {
            $window.location.href = "/portal/login"
        }, function(data) {
            console.log('Failed to Logout:', data);
        })
    }

    $scope.changeLocation = function(url) {
        url = '#!' + url
        console.log('Url in change location:', url);
        $location.path(url);
    }
})