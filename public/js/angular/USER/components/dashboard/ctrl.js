app.controller('dashboardCtrl', function($rootScope, $scope, $mdToast, $mdDialog, $q, $timeout, recordService, UserInfo) {
    console.log('Dashboard Ctrl');
    var dashboardCtrl = this;
    var update = false;
    var formErrTime = 3 * 1000;
    $scope.showAddRecord = true;
    $scope.formErrMsg = ""
    var formErrTP
    $scope.addRecordForm = true;
    dashboardCtrl.addRecordForm = true;
    $scope.currUser = {}



    $scope.$on("UserInfo", function() {
        $scope.currUser = UserInfo.getUser()
    })

    $scope.selected = []

    function refreshRecord() {
        $scope.record = {
            httpHook: {},
            mqttHook: {}
        }
        dashboardCtrl.record = $scope.record
    }
    refreshRecord()

    function formErrTimeout(timeout) {
        $timeout.cancel(formErrTP)
        formErrTP = $timeout(function() {
            $scope.formErrMsg
        }, timeout)
    }

    var selectedWatch = $scope.$watch("selected", function() {
        console.log('$scope.selected Changed');
        if ($scope.selected.length > 0) {
            console.log('selected length > 0');
            $scope.showAddRecord = false
        } else {
            $scope.showAddRecord = true
        }
    })
    $scope.$on("$destroy", function() {
        if (selectedWatch) {
            selectedWatch()
        }
    })


    $scope.query = {
        sort: "name",
        recordsPerPage: 5,
        pageNo: 1
    }

    function listSuccess(res) {
        $scope.records = res.data
    }
    $scope.getList = function() {
        $scope.promise = recordService.list($scope.query, listSuccess).$promise;
    }
    $scope.getList()
    dashboardCtrl.getList = $scope.getList

    $scope.addRecordDialog = function($event) {
        $scope.addRecordForm = true
        dashboardCtrl.addRecordForm = true;
        refreshRecord()
        $mdDialog.show({
                templateUrl: "recordForm.html",
                controller: recordFormCtrl,
                controllerAs: "ctrl",
                targetEvent: $event,
                focusOnOpen: true,
                clickOutsideToClose: true,
                parent: angular.element(document.body),
                openFrom: '#addRecord',
                closeTo: "#addRecord",
            })
            .then(function(record) {
                $scope.getList()
            }, function() {
                console.log('Add Record Dialog Closed');
            })
    }
    $scope.editRecordDialog = function($event, record, index) {
        $scope.addRecordForm = false
        dashboardCtrl.addRecordForm = false
            // $scope.record = record;
        dashboardCtrl.record = record;
        $mdDialog.show({
                templateUrl: "recordForm.html",
                controller: recordFormCtrl,
                controllerAs: "ctrl",
                targetEvent: $event,
                focusOnOpen: true,
                clickOutsideToClose: true,
                parent: angular.element(document.body),
                openFrom: '#editRecord' + index,
                closeTo: "#editRecord" + index,
            })
            .then(function(record) {
                $scope.getList()
            }, function() {
                console.log('Edit Record Dialog Closed');
            })
    }
    $scope.changeEnabled = function(record) {
        // $event.stopPropagation();
        recordService.update({ id: record._id }, record, function(data) {}, function(data) {
            record.enabled = !record.enabled;
            $mdToast.show(
                $mdToast.simple()
                .textContent("Failed to Enable/Disable the Hook")
                .hideDelay(3000)
                .position("bottom center")
            )
        })
    }
    $scope.stopPropagation = function($event) {
        console.log('Stop Propogation click')
        $event.stopPropagation()
            // $event.preventDefault();
    }

    // $scope.removeRecord = function(record, index) {
    //     recordService.remove({ id: record._id }, function(data) {
    //         $scope.getList()
    //             // $scope.records.list.splice(index, 1)
    //     }, function(data) {
    //         console.error('Failed to Remove Record');
    //     })
    // }

    function recordFormCtrl($scope) {
        $scope.record = dashboardCtrl.record;
        $scope.addRecordForm = dashboardCtrl.addRecordForm
        console.log('record form controller:', $scope.record);
        var publicBrokers = [
            "iot.eclipse.org:1883",
            "test.mosquitto.org:1883",
            "broker.mqttdashboard.com:1883",
            "mqtt.swifitch.cz:1883"
        ]

        $scope.cancelDialog = function() {
            $mdDialog.cancel()
        }

        function success(res) {
            $mdDialog.hide()
        }

        function error(res) {
            $scope.formErrMsg = res.data
            console.error('Failed to Add Record');
            formErrTimeout(formErrTime)
        }
        $scope.saveRecord = function() {
            recordService.save($scope.record, success, error)
        }
        $scope.updateRecord = function() {
            recordService.update({ id: $scope.record._id }, $scope.record, success, error)
        }
        this.querySearch = function(query) {
            var result = query ? publicBrokers.filter(function(broker) {
                return broker.indexOf(query) > -1;
            }) : publicBrokers

            return result;
        }
        this.brokerChanged = function(broker) {
            console.log('Broker:', broker)
            $scope.record.mqttHook.broker = broker;
        }

        this.removeRecord = function(record, index) {
            console.log('Remove Record Called')
            recordService.remove({ id: record._id }, function(data) {
                dashboardCtrl.getList()
                console.log('Hiding dialog')
                $mdDialog.hide();
            }, function(data) {
                console.error('Failed to Remove Record');
            })
        }
    }
})