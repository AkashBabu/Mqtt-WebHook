app.factory("historyService", function($resource) {
    return $resource("/mqtt-webhooks/history", {}, {
        
    })
})