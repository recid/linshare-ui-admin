'use strict';

angular.module('linshareAdminApp').directive('lsDomainForm', [
  function() {
    return {
      restrict: 'A',
      transclude: false,
      scope: {
        reload: '&'
      },
      controller:
        ['$scope', '$modal', '$log', 'Domain', 'LdapConnection', 'DomainPattern', 'Enum', 'DomainPolicy', 'Authentication', 'MimePolicy', 'MailConfig',
        function($scope, $modal, $log, Domain, LdapConnection, DomainPattern, Enum, DomainPolicy, Authentication, MimePolicy, MailConfig) {
          $scope.ldapConnections = []
          $scope.domainPatterns = []
          $scope.userRoles = []
          $scope.domainPolicies = []
          LdapConnection.getAll(function successCallback(ldapConnections) {
            angular.forEach(ldapConnections, function(ldapConnection) {
              $scope.ldapConnections.push(LdapConnection.getId(ldapConnection));
            });
          });
          DomainPattern.getAll(function successCallback(domainPatterns) {
            angular.forEach(domainPatterns, function(domainPattern) {
              $scope.domainPatterns.push(DomainPattern.getId(domainPattern));
            });
          });
          $scope.userRoles = ['SIMPLE', 'ADMIN'];
          Enum.getOptions('language', function successCallback(languages) {
            $scope.languages = languages;
          });
          DomainPolicy.getAll(function successCallback(domainPolicies) {
            angular.forEach(domainPolicies, function(domainPolicy) {
              $scope.domainPolicies.push(DomainPolicy.getId(domainPolicy));
            });
          });
          Authentication.getCurrentUser().then(function successCallback(user) {
            $scope.isSuperAdmin = Authentication.isSuperAdmin(user);
          });
          $scope.addProvider = function() {
            if (!$scope.disableProvider) {
              $scope.domain.providers.push({
                ldapConnectionId: '',
                domainPatternId: '',
                baseDn: ''
              });
              $scope.disableProvider = true;
            } else {
              $log.error('Try to add more than one provider');
            }
          };
          $scope.deleteProvider = function() {
            if ($scope.disableProvider) {
              $scope.domain.providers.splice(0, 1);
              $scope.disableProvider = false;
            } else {
              $log.error('Try to delete an non existing provider');
            }
          }
          $scope.submit = function() {
            if ($scope.state === 'edit') {
              Domain.update(
                $scope.domain,
                function successCallback() {
                  $scope.reload();
                }
              );
            } else if ($scope.state === 'create') {
              Domain.add(
                $scope.domain,
                function successCallback() {
                  $scope.reload();
                }
              );
            } else {
              $log.error('Invalid state');
            }
          };
          $scope.remove = function() {
            if ($scope.state === 'edit') {
              var modalInstance = $modal.open({
                templateUrl: 'views/templates/confirm_dialog.html',
                controller: 'ConfirmDialogCtrl',
                resolve: {
                  content: function() {
                    return 'MANAGE_DOMAINS.CONFIRM_DELETE_FORM.PARAGRAPH';
                  }
                }
              });
              modalInstance.result.then(
                function validate() {
                  Domain.remove(
                    $scope.domain,
                    function successCallback() {
                      $scope.reload();
                    }
                  );
                }, function cancel() {
                  $log.debug('Deletion modal dismissed');
                }
              );
            } else {
              $log.error('Invalid state');
            }
          };
          $scope.cancel = function() {
            Domain.setCurrent(undefined);
          };
          $scope.reset = function() {
            $scope.state = Domain.getState();
            $scope.domain = Domain.copyCurrent();
            $scope.isRootDomain = $scope.domain.type === 'ROOTDOMAIN';
            $scope.disableProvider = ($scope.isRootDomain || $scope.domain.providers.length != 0);
            MailConfig.getAll(Domain.getCurrentId(), false, function successCallback(mailConfigs) {
              $scope.mailConfigs = mailConfigs;
            });
            MimePolicy.getAll(Domain.getCurrentId(), false, function successCallback(mimePolicies) {
              $scope.mimePolicies = mimePolicies;
            });
          };
          $scope.$watch(Domain.getCurrent,
            function(newValue, oldValue) {
              if (angular.isDefined(newValue) && newValue !== oldValue) {
                $scope.reset();
              }
            },
            true
          );

          $scope.reset();
        }
      ],
      templateUrl: 'views/templates/domains/domain_form.html',
      replace: false
    };
  }
]);
