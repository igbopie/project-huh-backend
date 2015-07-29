'use strict';
var angular = require('angular');
var services = require('../services');

/* Services */
services
    .factory('AuthService', ['$http', '$cookieStore', function ($http, $cookieStore) {

        var username = $cookieStore.get('username');
        var token = $cookieStore.get('token');
        var loginNotification;

        return {
            login: function (uname, password, callback) {
                $http.post('/api/user/login', {email: uname, password: password}).success(function (data) {
                    if (data.response) {
                        username = uname;
                        token = data.response.token;

                        $cookieStore.put('username', username);
                        $cookieStore.put('token', token);

                        callback(true);
                        if (loginNotification) {
                            loginNotification();
                        }
                    } else {
                        callback(false);
                    }
                }).error(function (error) {
                    callback(false);
                });
            },
            logout: function () {

                $cookieStore.remove('username');
                $cookieStore.remove('token');

                username = null;
                token = null;

                // TODO server invalidate

                if (loginNotification) {
                    loginNotification();
                }
            },
            isLoggedIn: function () {
                return token ? true : false;
            },
            getToken: function () {
                return token;
            },
            getUsername: function () {
                return username;
            },
            setLoginNotification: function (callback) {
                loginNotification = callback;
            }
        };
    }]);
