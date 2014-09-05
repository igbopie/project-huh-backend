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

markStarbucksControllers.controller('LoggedCtrl', ['$scope', '$routeParams',"TemplateService","MediaService",
    function($scope, $routeParams,TemplateService,MediaService) {
        TemplateService.getTemplates(function(err,data){

            $scope.templates = data;

            for(var i = 0; i < $scope.templates.length; i++){
                (function(template) {
                    MediaService.getMedia(template.mediaId, "thumb", function (mediaURL) {
                        template.mediaURL = mediaURL;
                    })
                })($scope.templates[i]);
            }
        });
    }]);

markStarbucksControllers.controller('CreateTemplateCtrl',[ '$scope',"MediaService","TemplateService","$location", function($scope,MediaService,TemplateService,$location) {
    $scope.onFileSelect = function($files) {
        MediaService.createMedia(
            $files,
            function(progress){

            },
            function(mediaId){
                $scope.mediaId = mediaId;
                MediaService.getMedia(mediaId,"thumb",function(url){
                    $scope.imgSrc = url;
                });

            }
        );
    };
    $scope.createTemplate = function(name,price,mediaId){
        TemplateService.createTemplate(name,price,mediaId,function(err,templateId){
            if(!err){
                $location.path('templates');
            }
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

