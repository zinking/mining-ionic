angular.module('mining.content')
    .controller('FollowTabCtrl', function($scope, $ionicLoading, $state, $ionicPopup, $ionicPopover,
                                             AccountDataService, ContentDataService, SessionService) {
        SessionService.refreshIfExpired();
        $scope.router = SessionService.routeUtil;

        $scope.viewModel = {
            isBusy:false,
            //totalUnReadCount: 0,
            opmlList : []
        };

        $scope.viewModel.isBusy = true;

        ContentDataService.listStarFeed().then(
            function(){
                $scope.viewModel.isBusy = false;
                var opmlList = globalUserData.StarOpml;
                _.each(opmlList, function(opml){
                    opml.isFolder = 'Outline' in opml;
                    opml.isOpen = false;
                });
                $scope.viewModel.opmlsList = opmlList;
                //$scope.viewModel.totalUnReadCount = globalUserData.totalUnReadCount;
            },
            function(){
                $scope.viewModel.isBusy = false;
                $ionicPopup.alert({
                    title: 'Loading Failed,fallback on cache'
                });
                ContentDataService.loadLocalUserData();
                $scope.viewModel.opmlsList = globalUserData.Opml;
            }
        );


    });