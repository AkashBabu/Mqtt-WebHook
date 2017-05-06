
app.config(function($locationProvider, $routeProvider, $routeSegmentProvider) {
    // $locationProvider.html5Mode({
    //     enabled: true,
    //     requireBase: false    
    // })
    // .hashPrefix('!')

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
})