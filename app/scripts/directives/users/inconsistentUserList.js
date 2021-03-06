'use strict';

angular.module('linshareAdminApp').directive('lsInconsistentUserList', [
  function() {
    return {
      restrict: 'A',
      transclude: true,
      scope: {},
      controller: ['$scope', '$filter', '$log', 'ngTableParams', 'User',
        function($scope, $filter, $log, ngTableParams, User) {
          $scope.$watch(User.getCurrent, function (newValue, oldValue) {
            if (angular.isUndefined(newValue)) {
              $scope.reloadList();
            }
          });
          $scope.edit = function(user) {
            User.setCurrent(user);
          };
          $scope.reloadList = function () {
            $scope.tableParams.reload();
          };
          $scope.tableParams = new ngTableParams({
            page: 1,        // show first page
            count: 10,      // count per page
            sorting: {
              lastName: 'asc',
            }
          }, {
            debugMode: false,
            total: 0, // length of data
            getData: function($defer, params) {
              User.getAllInconsistent(function(users) {
                users = params.sorting() ?
                                    $filter('orderBy')(users, params.orderBy()) :
                                    users;
                params.total(users.length);
                $defer.resolve(users.slice((params.page() - 1) * params.count(), params.page() * params.count()));
              });
            }
          });
        }
      ],
      templateUrl: 'views/templates/users/inconsistent_user_list.html',
      replace: false
    };
  }
]);
