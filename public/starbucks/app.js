/**
 * Created by igbopie on 02/09/14.
 */

var app = angular.module('markStarbucks', [
    'ngRoute',
    'ngCookies',
    'angularFileUpload',
    'markStarbucksControllers'
]);

app.directive('ngConfirmClick', [
    function(){
        return {
            link: function (scope, element, attr) {
                var msg = attr.ngConfirmClick || "Are you sure?";
                var clickAction = attr.ngConfirmedClick;
                element.bind('click',function (event) {
                    if ( window.confirm(msg) ) {
                        scope.$eval(clickAction)
                    }
                });
            }
        };
    }]);

app.directive('ng-image', [
    function(){
        return {
            link: function (scope, element, attr) {
                var msg = attr.ngConfirmClick || "Are you sure?";
                var clickAction = attr.ngConfirmedClick;

            }
        };
    }]);

app.directive('loadMediaId',  ['MediaService','$timeout',function(MediaService,$timeout) {

    function link(scope, element, attrs) {

            scope.$watch(attrs.loadMediaId, function(newValue) {
                $(element).after("<i id='"+newValue+"-loader' class='fa fa-spin fa-refresh'></i>");
                $timeout(function(){
                    console.log("loadMediaId:"+newValue+" ");

                    MediaService.getMedia(newValue,"thumb",function(image){
                        element.attr("src",image);
                        $("#"+newValue+"-loader").remove();
                    });
                },100);

                //load Image
                // Set visibility: false + inject temporary spinner overlay
                //element.addClass('spinner-hide');
                // element.parent().append('<span class="spinner"></span>');
            });
    }


    return {
        link: link
    };
}]);


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
            when('/templates/create', {
                templateUrl: 'partials/templates-create.html',
                controller: 'CreateTemplateCtrl'
            }).
            when('/templates/edit/:id', {
                templateUrl: 'partials/templates-create.html',
                controller: 'EditTemplateCtrl'
            }).

            when('/mapicon', {
                templateUrl: 'partials/mapicon.html',
                controller: 'MapIconList'
            }).
            when('/mapicon/create', {
                templateUrl: 'partials/mapicon-create.html',
                controller: 'MapIconCreate'
            }).
            when('/mapicon/edit/:id', {
                templateUrl: 'partials/mapicon-create.html',
                controller: 'MapIconEdit'
            }).
            when('/mapiconpack', {
                templateUrl: 'partials/mapiconpack.html',
                controller: 'MapIconPackList'
            }).
            when('/mapiconpack/create', {
                templateUrl: 'partials/mapiconpack-create.html',
                controller: 'MapIconPackCreate'
            }).
            when('/mapiconpack/edit/:id', {
                templateUrl: 'partials/mapiconpack-create.html',
                controller: 'MapIconPackEdit'
            }).
            otherwise({
                redirectTo: '/templates'
            });
    }]);

app.factory( 'AuthService', ['$http','$cookieStore',function($http,$cookieStore) {

    var username = $cookieStore.get('username');
    var userId =  $cookieStore.get('userId');
    var token = $cookieStore.get('token');
    var loginNotification;

    return {
        login: function(uname,password,callback) {
            $http.post('/api/user/login',{username:uname,password:password}).success(function(data) {
                if(data.response){
                    username = uname;
                    userId = data.response.userId;
                    token = data.response.token;

                    $cookieStore.put('username',username);
                    $cookieStore.put('userId',userId);
                    $cookieStore.put('token',token);

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

            $cookieStore.remove('username');
            $cookieStore.remove('userId');
            $cookieStore.remove('token');

            username = null;
            userId = null;
            token = null;

            //TODO server invalidate

            if(loginNotification){
                loginNotification();
            }
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

    this.getTemplate = function (id,callback) {
        $http.post(urlBase+'/view',{id:id,token:AuthService.getToken()}).success(function(data) {
            if(data.response){
                callback(null,data.response);
            }else{
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });
    };

    this.updateTemplate = function (id,name,price,mediaId,callback) {
        $http.post(urlBase+'/update',{id:id,name:name,price:price,mediaId:mediaId,token:AuthService.getToken()}).success(function(data) {
            if(data.response){
                callback(null,data.response);
            }else{
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });
    };

    this.createTemplate = function(name,price,mediaId,callback){
        $http.post(urlBase+"/create",{token:AuthService.getToken(),name:name,price:price,mediaId:mediaId}).success(function(data) {
            if(data.response){
                callback(null,data.response);
            }else{
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });
    }
    this.removeTemplate = function(id,callback){
        $http.post(urlBase+"/remove",{token:AuthService.getToken(),id:id}).success(function(data) {
            if(data.code == 200){
                callback(null);
            }else{
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });
    }
}]);

app.service('MapIconService', ['$http','AuthService', function ($http,AuthService) {

    var urlBase = '/api/mapicon';

    this.list = function (callback) {
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

    this.view = function (id,callback) {
        $http.post(urlBase+'/view',{id:id,token:AuthService.getToken()}).success(function(data) {
            if(data.response){
                callback(null,data.response);
            }else{
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });
    };

    this.update = function (id,name,tag,mediaId,pointsThreshold,packId,callback) {
        $http.post(urlBase+'/update',{id:id,name:name,tag:tag,mediaId:mediaId,token:AuthService.getToken(),pointsThreshold:pointsThreshold,packId:packId}).success(function(data) {
            if(data.response){
                callback(null,data.response);
            }else{
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });
    };

    this.create = function(name,tag,mediaId,pointsThreshold,packId,callback){
        $http.post(urlBase+"/create",{token:AuthService.getToken(),name:name,tag:tag,mediaId:mediaId,pointsThreshold:pointsThreshold,packId:packId}).success(function(data) {
            if(data.response){
                callback(null,data.response);
            }else{
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });
    }
    this.remove = function(id,callback){
        $http.post(urlBase+"/remove",{token:AuthService.getToken(),id:id}).success(function(data) {
            if(data.code == 200){
                callback(null);
            }else{
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });
    }
}]);


app.service('MapIconPackService', ['$http','AuthService', function ($http,AuthService) {

    var urlBase = '/api/mapicon/pack';

    this.list = function (callback) {
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

    this.view = function (id,callback) {
        $http.post(urlBase+'/view',{id:id,token:AuthService.getToken()}).success(function(data) {
            if(data.response){
                callback(null,data.response);
            }else{
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });
    };

    this.update = function (id,name,tag,mediaId,pointsThreshold,isFree,appStoreCode,callback) {
        $http.post(urlBase+'/update',{id:id,name:name,tag:tag,mediaId:mediaId,token:AuthService.getToken(),pointsThreshold:pointsThreshold,isFree:isFree,appStoreCode:appStoreCode}).success(function(data) {
            if(data.response){
                callback(null,data.response);
            }else{
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });
    };

    this.create = function(name,tag,mediaId,pointsThreshold,isFree,appStoreCode,callback){
        $http.post(urlBase+"/create",{token:AuthService.getToken(),name:name,tag:tag,mediaId:mediaId,pointsThreshold:pointsThreshold,isFree:isFree,appStoreCode:appStoreCode}).success(function(data) {
            if(data.response){
                callback(null,data.response);
            }else{
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });
    }
    this.remove = function(id,callback){
        $http.post(urlBase+"/remove",{token:AuthService.getToken(),id:id}).success(function(data) {
            if(data.code == 200){
                callback(null);
            }else{
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });
    }
}]);


app.service('MediaService', ['$http','$upload','AuthService', function ($http,$upload,AuthService) {

    var urlBase = '/api/media';
    var self = this;

    this.createMedia = function($files,updateProgressCallback,callback){
        //$files: an array of files selected, each file has name, size, and type.
        for (var i = 0; i < $files.length; i++) {
            var file = $files[i];
            //TODO save return to cancel uploads!
            var uploadStatus = $upload.upload({
                url: '/api/media/create', //upload.php script, node.js route, or servlet url
                method: 'POST',
                data: {token: AuthService.getToken()},
                file: file
            }).progress(function(evt) {
                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                updateProgressCallback(parseInt(100.0 * evt.loaded / evt.total));
            }).success(function(data, status, headers, config) {
                // file is uploaded successfully
                console.log("Media uploaded: "+data.response);
                callback(data.response);
            });
        }
    }

    this.getMedia = function(mediaId,format,callback) {
        self.getBinary(mediaId,format, AuthService.getToken(), function (binary) {
            var dataURL = "data:image/jpeg;base64," + self.base64Encode(binary);
            callback(dataURL);
        });
    }

    this.getBinary = function(mediaId,format,token,callback){
        var params = JSON.stringify({ token: token });
        var xhr = new XMLHttpRequest();
        xhr.open("POST", '/api/media/get/'+format+'/'+mediaId, false);

        xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
        xhr.setRequestHeader("Content-length", params.length);
        xhr.setRequestHeader("Connection", "close");
        xhr.overrideMimeType("text/plain; charset=x-user-defined");

        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4 && xhr.status == 200) {
                callback(xhr.responseText);
            }
        }

        xhr.send(params);


    }
    this.base64Encode = function(str) {
        var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var out = "", i = 0, len = str.length, c1, c2, c3;
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if (i == len) {
                out += CHARS.charAt(c1 >> 2);
                out += CHARS.charAt((c1 & 0x3) << 4);
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i == len) {
                out += CHARS.charAt(c1 >> 2);
                out += CHARS.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
                out += CHARS.charAt((c2 & 0xF) << 2);
                out += "=";
                break;
            }
            c3 = str.charCodeAt(i++);
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
            out += CHARS.charAt(c3 & 0x3F);
        }
        return out;
    }

}]);