
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
    .factory("UserInfo", function () {
        this.user = {}
        var self = this;
        return {
            setUser: function (user) {
                self.user = user;
            },
            getUser: function () {
                return self.user;
            }
        }
    })
    .run(function ($rootScope, $resource, $timeout, UserInfo) {
        var User = $resource("/api/users/current")
        $timeout(function () {

            User.get(function (res) {
                UserInfo.setUser(res.data)
                console.log('broadCasting Event');
                $rootScope.$broadcast("UserInfo")
                // $rootScope.$emit("UserInfo")
            }, function (res) {
                console.error('Failed to get Current User');
            })
        }, 1000)
    })