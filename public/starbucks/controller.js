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

markStarbucksControllers.controller('CreateTemplateCtrl', ['$scope', '$routeParams',"TemplateService","AuthService",
    function($scope, $routeParams,TemplateService,AuthService) {

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