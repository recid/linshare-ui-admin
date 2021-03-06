'use strict';

angular.module('linshareAdminApp')
  .factory('Domain',
    ['$log', 'Notification', 'Restangular',
    function ($log, Notification, Restangular) {
      this.currentDomain = undefined;
      this.state = undefined;
      this.lastAccess = undefined;

      function createSample(_parent, _type) {
        var sample = {};
        sample.parent = _parent.identifier;
        sample.type = _type;
        sample.providers = [];
        if(_type === 'GUESTDOMAIN') {
          sample.userRole = 'SIMPLE';
        }
        return sample;
      }

      var self = this;

      /**
       * As domains are returned as tree, 
       * we need to put restangular route manually in all domains
       */
      function restangularizeTree(domain, route) {
        Restangular.restangularizeElement(null, domain, route);
        if (!_.isEmpty(domain.children)) {
          angular.forEach(domain.children, function(child) {
            restangularizeTree(child, route);
          });
        }
      }

      // Public API here
      return {
        getDomainTree: function(domainId, successCallback) {
          $log.debug('Domain:getDomainTree');
          return Restangular.all('domains').one(domainId).get({tree: true}).then(
            function success(rootDomain) {
              restangularizeTree(rootDomain, 'domains');
              if (successCallback) {
                return successCallback(rootDomain);
              }
            },
            function error() {
              $log.error(
                [
                 'Domain:getDomainTree',
                 'Unable to get domain tree',
                ].join('\n')
              );
            }
          );
        },
        getAll: function(successCallback) {
          $log.debug('Domain:getAll');
          return Restangular.all('domains').getList().then(
            function success(domains) {
              if (successCallback) {
                return successCallback(domains);
              }
            },
            function error() {
              $log.error(
                [
                 'Domain:getAll',
                 'Unable to get all domains',
                ].join('\n')
              );
            }
          );
        },
        add: function(domain, successCallback) {
          $log.debug('Domain:add');
          return Restangular.all('domains').post(domain).then(
            function success(domain) {
              Notification.addSuccess('CREATE');
              if (successCallback) {
                return successCallback(domain);
              }
            },
            function error() {
              $log.error(
                [
                 'Domain:add',
                 'Unable to create a domain',
                ].join('\n')
              );
              $log.error(domain);
            }
          );
        },
        update: function(domain, successCallback, notify) {
          $log.debug('Domain:update');
          notify = typeof notify !== 'undefined' ? notify : true;
          delete domain.children;
          return domain.put().then(
            function success(domain) {
              if (notify) {
                Notification.addSuccess('UPDATE');
              }
              if (successCallback) {
                return successCallback(domain);
              }
            },
            function error() {
              $log.error(
                [
                 'Domain:update',
                 'Unable to update a domain',
                ].join('\n')
              );
              $log.error(domain);
            }
          );
        },
        remove: function(domain, successCallback) {
          $log.debug('Domain:remove');
          return domain.remove().then(
            function success(domain) {
              Notification.addSuccess('DELETE');
              if (successCallback) {
                return successCallback(domain);
              }
            },
            function error() {
              $log.error(
                [
                 'Domain:remove',
                 'Unable to remove domain',
                ].join('\n')
              );
              $log.error(domain);
            }
          );
        },
        setCurrentTopDomainSample: function(rootDomain) {
          $log.debug('Domain:setCurrentTopDomainSample');
          self.state = 'create';
          self.currentDomain = createSample(rootDomain, 'TOPDOMAIN');
        },
        setCurrentSubDomainSample: function(topDomain) {
          $log.debug('Domain:setCurrentSubDomainSample');
          self.state = 'create';
          self.currentDomain = createSample(topDomain, 'SUBDOMAIN');
        },
        setCurrentGuestDomainSample: function(topDomain) {
          $log.debug('Domain:setCurrentGuestDomainSample');
          self.state = 'create';
          self.currentDomain = createSample(topDomain, 'GUESTDOMAIN');
        },
        setCurrent: function(domain) {
          $log.debug('Domain:setCurrent');
          self.state = 'edit';
          self.lastAccess = Date.now();
          self.currentDomain = domain;
        },
        getLastAccess: function() {
          return self.lastAccess;
        },
        getCurrent: function() {
          return self.currentDomain;
        },
        getCurrentId: function() {
          return self.currentDomain.identifier;
        },
        getId: function(domain) {
          return domain.identifier;
        },
        getState: function() {
          return self.state;
        },
        copyCurrent: function() {
          return Restangular.copy(self.currentDomain);
        },
        currentIsDefined: function() {
          return angular.isDefined(self.currentDomain);
        }
      };
    }
  ]
);
