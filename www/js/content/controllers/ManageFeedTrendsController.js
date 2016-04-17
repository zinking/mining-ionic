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

        $scope.loadFeedStats = function() {
            ContentDataService.loadLastMonthFeedStats().then(
                function(data){
                    $scope.viewModel.isBusy = false;
                    if (data.error!=null){
                        $ionicPopup.alert({
                            title: 'Load last month stats issue',
                            subtitle:data.error
                        });
                    }
                    else{
                        $scope.viewModel.activeFeeds = data.ActiveFeeds;
                        $scope.viewModel.inActiveFeeds = data.InActiveFeeds;

                        _.forEach($scope.viewModel.inActiveTrend,function(feedStat){
                            feedStat.Deleted = false;
                        });
                    }
                },
                function(){
                    $scope.viewModel.isBusy = false;
                    $ionicPopup.alert({
                        title: 'Load last month stats Faild, retry later'
                    });
                }
            )
        };

        $scope.loadFeedStats();



        $scope.unSubscribe = function(feedStat) {
            var xmlUrl = globalUserData.FeedId2Url[feedStat.FeedId];

            ContentDataService.removeFeedSource(xmlUrl).then(
                function(data){
                    if (data.error!=null){
                        console.log(data.error);
                    }
                    else {
                        console.log("Item Removed");
                        feedStat.Deleted = true;
                    }
                },
                function(){
                    console.log("unsubscribe failed")
                }
            );


        }


});