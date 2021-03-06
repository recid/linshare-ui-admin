'use strict';

angular.module('linshareAdminApp').directive('lsUploadRequestForm', [
  function() {
    return {
      restrict: 'A',
      transclude: false,
      scope: {},
      controller:
        ['$scope', '$filter', '$log', 'ngTableParams', 'Enum', 'UploadRequest',
        function($scope, $filter, $log, ngTableParams, Enum,  UploadRequest) {
          $scope.allStatus = [];
          $scope.criteria = {
            status: []
          };
          $scope.toggleSelection = function toggleSelection(s) {
            var idx = $scope.criteria.status.indexOf(s);
            if (idx > -1) {
              $scope.criteria.status.splice(idx, 1);
            } else {
              $scope.criteria.status.push(s);
            }
          };
          $scope.reloadList = function () {
            $scope.tableParams.reload();
          };
          $scope.opened = {
            from: false,
            to : false,
          };
          $scope.humanFileSize = function(bytes, si) {
            var thresh = si ? 1000 : 1024;
            if (bytes < thresh) return bytes + ' B';
            var units = si ? ['kB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
            var u = -1;
            do {
              bytes /= thresh;
              ++u;
            } while (bytes >= thresh);
            return bytes.toFixed(1) + ' ' + units[u];
          };
          $scope.setCurrentUuid = function (uuid) {
            $scope.currentUuid = uuid;
            $scope.tableParamsHistory.reload();
          };
          Enum.getOptions('upload_request_status', function successCallback(actions) {
            $scope.allStatus = actions;
          });
          $scope.open = function(key, $event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened[key] = true;
          };
          $scope.tableParams = new ngTableParams({
            page: 1,        // show first page
            count: 10,      // count per page
            sorting: {
              subject: 'desc'
            }
          }, {
            debugMode: false,
            total: 0, // length of data
            getData: function($defer, params) {
              UploadRequest.query($scope.criteria, function successCallback(uploadRequests) {
                $scope.currentUuid = undefined;
                var orderedData = params.sorting() ?
                                    $filter('orderBy')(uploadRequests, params.orderBy()) :
                                    uploadRequests;
                params.total(orderedData.length);
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
              });
            }
          });
          $scope.tableParamsHistory = new ngTableParams({
            page: 1,        // show first page
            count: 10,      // count per page
            sorting: {
              modificationDate: 'desc'
            }
          }, {
            debugMode: false,
            total: 0, // length of data
            getData: function($defer, params) {
              if ($scope.currentUuid) {
                UploadRequest.history($scope.currentUuid, function successCallback(history) {
                  var orderedData = params.sorting() ?
                                      $filter('orderBy')(history, params.orderBy()) :
                                      history;
                  params.total(orderedData.length);
                  $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                });
              } else {
                $defer.resolve();
              }
            }
          });
        }
      ],
      templateUrl: 'views/templates/history/upload_request_form.html',
      replace: false
    };
  }
]);

