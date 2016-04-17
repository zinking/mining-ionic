angular.module('mining.content')
.controller(
    'ManageCtrl', function(
        $scope, $ionicLoading,$state,$ionicSideMenuDelegate,$ionicPopup,
        AccountDataService, ContentDataService, SessionService
    ){
        $scope.viewModel = {

        };

        if (typeof globalUserData === "undefined") {
            $state.go('tab.contents');
            return;
        }

        $scope.goHome = function(){
            $state.go('tab.contents');
            return;
        };

        $scope.arrangeFeeds = function() {
            $state.go('arrangefeed');
            return;
        };

        $scope.readingTrends = function() {
            $state.go('readingtrends');
            return;
        };

        $scope.feedTrends = function() {
            $state.go('feedtrends');
            return;
        };


});