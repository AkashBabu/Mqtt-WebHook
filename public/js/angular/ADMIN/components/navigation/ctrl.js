app.controller("NavCtrl", function($window, $location, $scope, $mdSidenav, $mdMedia, logoutService) {
    console.log('Navigation Controller');

    // $scope.showSidenav = $mdMedia('gt-md')
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
        // url = '#!' + url
        console.log('Url in change location:', url);
        $location.path(url);
    }
})