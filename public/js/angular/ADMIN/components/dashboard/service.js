app.factory("recordService", function($resource) {
    return $resource("/api/mqtt-webhooks/:id", {id: "@_id"}, {
        list: {
            method: 'GET'
        },
        update: {
            method: "PUT"
        }
    })
})