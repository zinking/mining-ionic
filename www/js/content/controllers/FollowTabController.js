angular.module('mining.content')
    .controller('FollowTabCtrl', function($scope, $ionicLoading, $state, $ionicPopup, $ionicPopover,
                                             AccountDataService, ContentDataService, SessionService, UserDataModel) {
        SessionService.refreshIfExpired();
        $scope.router = SessionService.routeUtil;

        $scope.viewModel = {
            isBusy:false,
            //totalUnReadCount: 0,
            omplsList : []
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

        $scope.openFolder = function (opml) {
            opml.isOpen = !opml.isOpen;
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.$broadcast('scroll.resize');
        };


    });