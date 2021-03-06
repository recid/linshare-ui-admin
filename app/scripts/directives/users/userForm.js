'use strict';

angular.module('linshareAdminApp').directive('lsUserForm', [
  function() {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.userRepresentation = function(user) {
          return user.firstName + ' ' + user.lastName + ' <' + user.mail + '>';
        };
        scope.today = new Date();
      },
      controller: ['$scope', '$modal', '$log', 'User', 'Functionality', 'Enum',
        function($scope, $modal, $log, User, Functionality, Enum) {
          Enum.getOptions('role', function successCallback(userRoles) {
            $scope.userRoles = _.remove(userRoles, function(role) {
              return role !== 'SYSTEM' && role !== 'SUPERADMIN';
            });
          });
          $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
          };
          $scope.limit = new Date();
          $scope.removeContact = function(user, index) {
            user.restrictedContacts.splice(index, 1);
          };
          $scope.addContact = function(user, contact) {
            if (!_.contains(user.restrictedContacts, contact.mail)) {
              user.restrictedContacts.push(contact.mail);
            }
          };
          $scope.$watch(User.getCurrent, function(newValue, oldValue) {
            if (angular.isDefined(newValue)) {
              $scope.reset();
              Functionality.get(newValue.domain , 'ACCOUNT_EXPIRATION',
                function successCallback(functionality) {
                  var date = new Date();
                  var delta = functionality.parameters[0].integer;
                  if (functionality.parameters.string === 'DAY') {
                    date.setDay(date.getDay() + delta);
                  } else if (functionality.parameters.string === 'WEEK') {
                    date.setWeek(date.getWeek() + delta);
                  } else {
                    date.setMonth(date.getMonth() + delta);
                  }
                  $scope.limit = date;
                }
              );
              Functionality.get(newValue.domain, 'RESTRICTED_GUEST',
                function successCallback(functionality) {
                  $scope.restrictedDisabled = (functionality.activationPolicy.policy != 'ALLOWED');
                }
              );
            }
          }, true);
          $scope.cancel = function() {
            User.setCurrent(undefined);
          };
          $scope.reset = function() {
            $scope.user = User.copyCurrent();
          };
          $scope.submit = function(user) {
            if (!_.isEqual($scope.user.expirationDate, User.getCurrent().expirationDate)) {
              // Convert datepicker date in timestamp
              $scope.user.expirationDate = $scope.user.expirationDate.getTime();
            }
            User.update($scope.user, function successCallback(user) {
              $scope.cancel();
            });
          };
          $scope.delete = function(user) {
            var modalInstance = $modal.open({
              templateUrl: 'views/templates/confirm_dialog.html',
              controller: 'ConfirmDialogCtrl',
              resolve: {
                content: function() {
                  return 'MANAGE_USERS.CONFIRM_DELETE_FORM.PARAGRAPH';
                }
              }
            });
            modalInstance.result.then(
              function validate() {
                User.remove($scope.user,
                  function successCallback(user) {
                    $scope.cancel();
                  }
                );
              }, function cancel() {
                $log.debug('Deletion modal dismissed');
              }
            );
          };
        }
      ],
      templateUrl: 'views/templates/users/user_form.html',
      replace: false
    };
  }
]);
