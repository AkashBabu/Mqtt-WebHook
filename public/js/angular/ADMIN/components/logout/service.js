app.factory('logoutService', function($resource) {
    return $resource("/api/logout", {}, {
        logout: {
            method: "GET"
        }
    })
})