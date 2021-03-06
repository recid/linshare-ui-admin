'use strict';

angular.module('linshareAdminApp')
  .factory('User', ['$log', 'Restangular', 'Notification',
    function ($log, Restangular, Notification) {
      this.currentUser = undefined;

      var self = this;

      // Public API here
      return {
        autocomplete: function(pattern, successCallback) {
          $log.debug('User:autocomplete');
          return Restangular.all('users').one('autocomplete', pattern).get().then(
            function success(users) {
              return successCallback(users);
            },
            function error() {
              $log.error(
                [
                 'User:autocomplete',
                 'Unable to autocomplete users',
                ].join('\n')
              );
              $log.error(pattern);
            }
          );
        },
        search: function(userSearchDto, successCallback) {
          $log.debug('User:search');
          return Restangular.all('users').customPOST(userSearchDto, 'search').then(
            function success(users) {
              angular.forEach(users, function(user) {
                user = Restangular.restangularizeElement(null, user, 'users');
              });
              return successCallback(users);
            },
            function error() {
              $log.error(
                [
                 'User:search',
                 'Unable to search users',
                ].join('\n')
              );
              $log.error(userSearchDto);
            }
          );
        },
        getAllInconsistent: function(successCallback) {
          $log.debug('User:getAllInconsistent');
          return Restangular.all('users').all('inconsistent').getList().then(
            function success(users) {
              return successCallback(users);
            },
            function error() {
              $log.error(
                [
                 'User:getAllInconsistent',
                 'Unable to get all inconsistent users',
                ].join('\n')
              );
            }
          );
        },
        update: function(user, successCallback) {
          $log.debug('User:update');
          return user.put().then(
            function success(user) {
              Notification.addSuccess('UPDATE');
              if (successCallback) {
                return successCallback(user);
              }
            },
            function error() {
              $log.error(
                [
                 'User:update',
                 'Unable to update user',
                ].join('\n')
              );
              $log.error(user);
            }
          );
        },
        remove: function(user, successCallback) {
          $log.debug('User:remove');
          return user.remove().then(
            function success(user) {
              Notification.addSuccess('DELETE');
              if (successCallback) {
                return successCallback(user);
              }
            },
            function error() {
              $log.error(
                [
                 'User:remove',
                 'Unable to remove user',
                ].join('\n')
              );
              $log.error(user);
            }
          );
        },
        setCurrent: function(user) {
          $log.debug('User:setCurrent');
          self.currentUser = user;
        },
        getCurrent: function() {
          return self.currentUser;
        },
        copyCurrent: function() {
          return Restangular.copy(self.currentUser);
        },
        currentIsDefined: function() {
          return angular.isDefined(self.currentUser);
        }
      };
    }
  ]
);
