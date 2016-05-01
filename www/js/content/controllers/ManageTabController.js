angular.module('mining.content')
.controller(
    'ManageTabCtrl', function(
        $scope, $ionicLoading,$state,$ionicSideMenuDelegate,$ionicPopup,
        AccountDataService, ContentDataService, SessionService
    ){
        $scope.viewModel = {

        };

        SessionService.refreshIfExpired();
        $scope.router = SessionService.routeUtil;

});