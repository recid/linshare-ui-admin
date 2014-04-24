'use strict';

/* Services */

angular.module('linshareAdminApp')
  .factory('Notification', ['$rootScope', '$timeout', '$log', '$translate',
  function($rootScope, $timeout, $log, $translate) {
    return {
      addSuccess: function(action) {
        $log.debug('Notification:addSuccess');
        var newAlert = {};
        newAlert.type = 'success';
        newAlert.msg = $translate('COMMON.NOTIFICATION.SUCCESS.' + action);
        $rootScope.$broadcast('pushAlert', newAlert);
      },
      addError: function(newAlert) {
        $log.debug('Notification:addError');
        newAlert.type = 'danger';
        newAlert.msg = $translate('COMMON.NOTIFICATION.ERROR.' + newAlert.errCode);
        $rootScope.$broadcast('pushAlert', newAlert);
      }
    };
  }
]);
