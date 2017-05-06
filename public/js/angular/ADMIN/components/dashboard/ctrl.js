app.controller('dashboardCtrl', function ($rootScope, $scope, $mdToast, $mdDialog, recordService, UserInfo) {
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
        formErrTP = $timeout(function () {
            $scope.formErrMsg
        }, timeout)
    }

    var selectedWatch = $scope.$watch("selected", function () {
        console.log('$scope.selected Changed');
        if ($scope.selected.length > 0) {
            console.log('selected length > 0');
            $scope.showAddRecord = false
        } else {
            $scope.showAddRecord = true
        }
    })
    $scope.$on("$destroy", function () {
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
    $scope.getList = function () {
        $scope.promise = recordService.list($scope.query, listSuccess).$promise;
    }
    $scope.getList()

    $scope.addRecordDialog = function ($event) {
        $scope.addRecordForm = true
        dashboardCtrl.addRecordForm = true;
        refreshRecord()
        $mdDialog.show({
            templateUrl: "recordForm.html",
            controller: recordFormCtrl,
            targetEvent: $event,
            focusOnOpen: true,
            clickOutsideToClose: true,
            parent: angular.element(document.body),
            openFrom: '#addRecord',
            closeTo: "#addRecord",
        })
        .then(function (record) {
                $scope.getList()
            }, function () {
                console.log('Add Record Dialog Closed');
            })
    }
    $scope.editRecordDialog = function ($event, record, index) {
        $scope.addRecordForm = false
        dashboardCtrl.addRecordForm = false
        // $scope.record = record;
        dashboardCtrl.record = record;
        $mdDialog.show({
            templateUrl: "recordForm.html",
            controller: recordFormCtrl,
            targetEvent: $event,
            focusOnOpen: true,
            clickOutsideToClose: true,
            parent: angular.element(document.body),
            openFrom: '#editRecord' + index,
            closeTo: "#editRecord" + index,
        })
            .then(function (record) {
                $scope.getList()
            }, function () {
                console.log('Edit Record Dialog Closed');
            })
    }
    $scope.changeEnabled = function(record) {
        recordService.update({id: record._id}, record, function(data) {}, function(data) {
            record.enabled = !record.enabled;
            $mdToast.show(
                $mdToast.simple()
                    .textContent("Failed to Enable/Disable the Hook")
                    .hideDelay(3000)
                    .position("bottom center")
            )
        })
    }

    $scope.removeRecord = function (record, index) {
        recordService.remove({ id: record._id }, function (data) {
            $scope.getList()
            // $scope.records.list.splice(index, 1)
        }, function (data) {
            console.error('Failed to Remove Record');
        })
    }

    function recordFormCtrl($scope) {
        $scope.record = dashboardCtrl.record;
        $scope.addRecordForm = dashboardCtrl.addRecordForm
        console.log('record form controller:', $scope.record);

        $scope.cancelDialog = function () {
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
        $scope.saveRecord = function () {
            recordService.save($scope.record, success, error)
        }
        $scope.updateRecord = function () {
            recordService.update({ id: $scope.record._id }, $scope.record, success, error)
        }
    }
})