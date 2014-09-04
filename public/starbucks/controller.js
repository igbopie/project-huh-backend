var markStarbucksControllers = angular.module('markStarbucksControllers', []);

markStarbucksControllers.controller('LoginCtrl', ['$scope', '$http',"$location","AuthService",
    function ($scope, $http,$location,AuthService) {
        //$http.get('phones/phones.json').success(function(data) {
        //    $scope.phones = data;
        //});

        //$scope.orderProp = 'age';

        $scope.login = function(username,password){
            if(AuthService.isLoggedIn()){
                $location.path('templates');
            }else{
                AuthService.login(username,password,function(success){
                    if(success){
                        $location.path('templates');
                    }
                })
            }
        }


    }]);

markStarbucksControllers.controller('LoggedCtrl', ['$scope', '$routeParams',"TemplateService","AuthService",
    function($scope, $routeParams,TemplateService,AuthService) {
        TemplateService.getTemplates(function(err,data){
            $scope.templates = data;
        });
    }]);

markStarbucksControllers.controller('CreateTemplateCtrl',[ '$scope', '$upload',"AuthService",'$http', function($scope, $upload,AuthService,$http) {
    $scope.onFileSelect = function($files) {
        //$files: an array of files selected, each file has name, size, and type.
        for (var i = 0; i < $files.length; i++) {
            var file = $files[i];
            $scope.upload = $upload.upload({
                url: '/api/media/create', //upload.php script, node.js route, or servlet url
                method: 'POST',
                data: {token: AuthService.getToken()},
                file: file
            }).progress(function(evt) {
                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function(data, status, headers, config) {
                // file is uploaded successfully
                $scope.mediaId = data.response;
                $scope.loadPhoto(data.response);
            });
        }
    };
    $scope.loadPhoto = function(mediaId){
        getBinaryMark(mediaId,AuthService.getToken(),function(binary){
            var dataURL="data:image/jpeg;base64,"+base64Encode(binary);
            console.log(dataURL);
            $scope.imgSrc = dataURL;
        });


    }
}]);


markStarbucksControllers.controller('NavCtrl', ['$scope', '$routeParams',"AuthService",
    function($scope, $routeParams,AuthService) {

        $scope.isLoggedIn = AuthService.isLoggedIn();
        $scope.username = AuthService.getUsername();
        AuthService.setLoginNotification(function(){
            $scope.isLoggedIn = AuthService.isLoggedIn();
            $scope.username = AuthService.getUsername();
        })

    }]);

function getBinary(file){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", file, false);
    xhr.overrideMimeType("text/plain; charset=x-user-defined");
    xhr.send(null);
    return xhr.responseText;
}

function getBinaryMark(mediaId,token,callback){
    var params = JSON.stringify({ token: token });
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/api/media/get/thumb/'+mediaId, false);

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
function base64Encode(str) {
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