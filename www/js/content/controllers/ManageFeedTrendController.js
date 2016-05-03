angular.module('mining.content')
.controller(
    'ManageFeedTrendCtrl', function(
        $scope, $ionicLoading,$state,$ionicSideMenuDelegate,$ionicPopup,
        AccountDataService, ContentDataService, SessionService
    ){

        SessionService.refreshIfExpired();
        $scope.router = SessionService.routeUtil;

        $scope.viewModel = {
            currentOpmlFeeds:[],
            isBusy: false,
            folderOptions:[]
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
                        title: 'Load last month stats Failed, retry later'
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
                    console.log("unSubscribe failed")
                }
            );


        }


});