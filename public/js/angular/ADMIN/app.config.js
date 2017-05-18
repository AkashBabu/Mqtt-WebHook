
app.config(function ($locationProvider, $routeProvider, $routeSegmentProvider, $mdThemingProvider) {

    $mdThemingProvider.theme('default')

    $routeSegmentProvider
        .when("/dashboard", "dashboard")
        .when("/history", "history")

        .segment("dashboard", {
            "default": true,
            templateUrl: "/portal/dashboard",
            controller: "dashboardCtrl"
        })
        .segment("history", {
            templateUrl: "/portal/history",
            controller: "historyCtrl"
        })

    $routeProvider
        .otherwise({
            redirectTo: "/dashboard"
        })
    // $locationProvider.html5Mode({
    //     enabled: true,
    //     requireBase: true
    // })
    // .hashPrefix('')
    // $locationProvider.html5Mode(true)
})
    .factroy("UserInfo", function () {
        this.user = {}
        this.setUser = function (user) {
            this.user = user;
        }
        this.getUser = function () {
            return this.user;
        }
    })
    .run(function ($rootScope, $resource, $timeout, UserInfo) {
        var User = $resource("/api/users/current")
        // $timeout(function () {

        User.get(function (res) {
            UserInfo.setUser(res.data)
            // console.log('broadCasting Event');
            // $rootScope.$broadcast("UserInfo")
            // $rootScope.$emit("UserInfo")
        }, function (res) {
            console.error('Failed to get Current User');
        })
        // }, 1000)
    })