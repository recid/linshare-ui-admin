'use strict';

angular.module('myApp.controllers')
  .controller('DomainPatternCtrl',
    ['$scope', '$filter', '$log', 'ngTableParams', 'DomainPattern',
      function ($scope, $filter, $log, ngTableParams, DomainPattern) {
        $scope.getCurrentDomainPattern = function() {
          return DomainPattern.getCurrent();
        };
        $scope.reloadList = function () {
          $scope.tableParams.reload();
        };
        $scope.$watch(DomainPattern.getCurrent, function (newValue, oldValue) {
          if (angular.isUndefined(newValue)) {
            $scope.reloadList();
          }
        });
        $scope.edit = function(domainPattern) {
          DomainPattern.setCurrent(domainPattern);
        };
        $scope.create = function() {
          DomainPattern.setCurrent({});
        };
        $scope.tableParams = new ngTableParams({
          page: 1,        // show first page
          count: 10,      // count per page
        }, {
          debugMode: false,
          total: 0, // length of data
          getData: function($defer, params) {
            DomainPattern.getAll(function(domainPatterns) {
              var orderedData = params.sorting() ?
                                  $filter('orderBy')(domainPatterns, params.orderBy()) :
                                  domainPatterns;
              params.total(orderedData.length);
              $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            });
          }
        });
      }
    ]
  );
