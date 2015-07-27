'use strict';
var angular = require('angular');
var services = require('../services');
var _ = require('lodash');

/* Services */
services
    .service('HttpsService', function ($location) {
        return {
            force: function () {
                if ($location.protocol() !== 'https' && !_.startsWith($location.absUrl(), "http://localhost")) {
                    window.location.href = $location.absUrl().replace(/^http/, 'https');
                }
            }
        };
    });
