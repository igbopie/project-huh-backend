/**
 * Created by igbopie on 02/09/14.
 */

var app = angular.module('markStarbucks', [
    'ngRoute',
    'markStarbucksControllers'
]);

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/login', {
                templateUrl: 'partials/login.html',
                controller: 'LoginCtrl'
            }).
            when('/templates', {
                templateUrl: 'partials/templates.html',
                controller: 'LoggedCtrl'
            }).
            otherwise({
                redirectTo: '/login'
            });
    }]);

app.factory( 'AuthService', ['$http',function($http) {
    var username;
    var userId;
    var token;
    var loginNotification;

    return {
        login: function(uname,password,callback) {
            $http.post('/api/user/login',{username:uname,password:password}).success(function(data) {
                if(data.response){
                    username = uname;
                    userId = data.response.userId;
                    token = data.response.token;
                    callback(true);
                    if(loginNotification){
                        loginNotification();
                    }
                }else{
                    callback(false);
                }
            }).error(function (error) {
                callback(false);
            });
        },
        logout: function() {
            //todo
        },
        isLoggedIn: function() {
            //return false;
            return token?true:false;
        },
        getToken: function() { return token; },
        getUsername: function() { return username; },
        setLoginNotification: function(callback) { loginNotification = callback; }
    };
}]);

app.service('TemplateService', ['$http','AuthService', function ($http,AuthService) {

    var urlBase = '/api/template';

    this.getTemplates = function (callback) {
        $http.post(urlBase,{token:AuthService.getToken()}).success(function(data) {
            if(data.response){
                callback(null,data.response);
            }else{
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });
    };

}]);