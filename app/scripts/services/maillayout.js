'use strict';

angular.module('linshareAdminApp')
  .factory('MailLayout',
    ['$log', 'Notification', 'Restangular',
    function ($log, Notification, Restangular) {
      this.currentMailLayout = undefined;

      var self = this;

      // Public API here
      return {
        getAll: function(domainId, onlyCurrentDomain, successCallback) {
          $log.debug('MailLayout:getAll');
          return Restangular.all('mail_layouts')
            .getList({domainId: domainId, onlyCurrentDomain: onlyCurrentDomain}).then(
              function success(mailLayouts) {
                if (successCallback) {
                  return successCallback(mailLayouts);
                }
              },
              function error() {
                $log.error(
                  [
                   'MailLayout:getAll',
                   'Unable to get all mail layout for domain',
                   domainId
                  ].join('\n')
                );
              }
          );
        },
        get: function(domainId, mailLayoutId, successCallback) {
          $log.debug('MailLayout:get');
          return Restangular.one('mail_layouts', mailLayoutId)
            .get({domainId: domainId}).then(
              function success(mailLayout) {
                if (successCallback) {
                  return successCallback(mailLayout);
                }
              },
              function error() {
                $log.error(
                  [
                   'MailLayout:get',
                   'Unable to get the mail layouts',
                   mailLayoutId,
                   'for domain',
                   domainId
                  ].join('\n')
                );
              }
          );
        },
        add: function(mailLayout, successCallback) {
          $log.debug('MailLayout:add');
          return Restangular.all('mail_layouts').post(mailLayout).then(
            function success(mailLayout) {
              Notification.addSuccess('CREATE');
              if (successCallback) {
                return successCallback(mailLayout);
              }
            },
            function error() {
              $log.error(
                [
                 'MailLayout:add',
                 'Unable to create a mail content',
                ].join('\n')
              );
              $log.error(mailLayout);
            }
          );
        },
        update: function(mailLayout, successCallback) {
          $log.debug('MailLayout:update');
          return mailLayout.put().then(
            function success(mailLayout) {
              Notification.addSuccess('UPDATE');
              if (successCallback) {
                return successCallback(mailLayout);
              }
            },
            function error() {
              $log.error(
                [
                 'MailLayout:update',
                 'Unable to update mail layout',
                 mailLayout.uuid
                ].join('\n')
              );
              $log.error(mailLayout);
            }
          );
        },
        remove: function(mailLayout, successCallback) {
          $log.debug('MailLayout:remove');
          return mailLayout.remove().then(
            function success() {
              Notification.addSuccess('DELETE');
              if (successCallback) {
                return successCallback(mailLayout);
              }
            },
            function error() {
              $log.error(
                [
                 'MailLayout:remove',
                 'Unable to remove mail layout',
                 mailLayout.uuid
                ].join('\n')
              );
              $log.error(mailLayout);
            }
          );
        },
        setCurrent: function(mailLayout) {
          $log.debug('MailLayout:setCurrent');
          self.currentMailLayout = mailLayout;
        },
        getCurrent: function() {
          return self.currentMailLayout;
        },
        copyCurrent: function() {
          return Restangular.copy(self.currentMailLayout);
        },
        currentIsDefined: function() {
          return angular.isDefined(self.currentMailLayout);
        }
      };
    }
  ]
);
