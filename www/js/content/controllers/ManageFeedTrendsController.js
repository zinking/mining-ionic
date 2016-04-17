angular.module('mining.content')
.controller(
    'FeedTrendsCtrl', function(
        $scope, $ionicLoading,$state,$ionicSideMenuDelegate,$ionicPopup,
        AccountDataService, ContentDataService, SessionService
    ){
        $scope.viewModel = {
            currentOpmlFeeds:[],
            isBusy: false,
            folderOptions:[]
        };

        if (typeof globalUserData === "undefined" ) {
            $state.go('tab.contents');
            return;
        }

        $scope.goHome = function(){
            $state.go('tab.manage')
        };




});