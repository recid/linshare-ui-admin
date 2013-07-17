'use strict';

app.directive('linshareDomainForm', [
  function() {
    return {
      restrict: 'A',
      transclude: false,
      link: function(scope, element, attrs) {
          scope.confirmDelete = true;
          scope.disableProvider = false;
          scope.addProvider = function() {
            scope.domain.providers.push({
              ldapConnection: '',
              domainPattern: '',
              baseDn: ''
            });
          };
          scope.deleteProvider = function() {
            scope.domain.providers.splice(0, 1);
          }
          scope.$watch('domain.providers', function(value) {
            if (!angular.isUndefined(value) && value.length >= 1) {
              scope.disableProvider = true;
            } else {
              scope.disableProvider = false;
            }
          }, true);
      },
      controller: ['$scope', '$route', 'Restangular', 'loggerService',
        function($scope, $route, Restangular, Logger) {
          $scope.$watch('currentDomain', function(value) {
            // isCreation ?
            if (_.isEmpty(value)) {
              $scope.submit = function(domain) {
                Logger.debug('domain creation :' + domain.identifier);
                Restangular.all('domains').post(domain).then(function successCallback() {
                  // refresh the page
                  $route.reload();
                }, function errorCallback() {
                  Logger.error('Unable to create the domain : ' + domain.identifier);
                });
              };
              $scope.reset = function() {
                $scope.domain = {};
              };
              $scope.reset();
              $scope.creation = true;
            } else {
              $scope.submit = function(domain) {
                Logger.debug('domain edition :' + domain.identifier);
                if (_.isUndefined(domain.route)) {
                  domain.route = 'domains';
                }
                domain.put().then(function successCallback(domains) {
                  // refresh the page
                  $route.reload();
                }, function errorCallback() {
                  Logger.error('Unable to update the domain : ' + domain.identifier);
                });
              };
              $scope.reset = function() {
                $scope.domain = Restangular.copy(value);
              };
              $scope.delete = function(domain) {
                Logger.debug('domain deletion : ' + domain.identifier);
                domain.remove().then(function successCallback() {
                  // refresh the page
                  $route.reload();
                }, function errorCallback() {
                  Logger.error('Unable to delete the domain : ' + domain.identifier);
                });
              }
              // Save the previous state
              $scope.reset();
              $scope.creation = false;
            }
          });
        }
      ],
      templateUrl: '/views/templates/forms/domain.html',
      replace: false
    };
  }
]);