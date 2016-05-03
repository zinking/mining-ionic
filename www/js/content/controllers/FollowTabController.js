angular.module('mining.content')
    .controller('FollowTabCtrl', function($scope, $ionicLoading, $state, $ionicPopup, $ionicPopover,
                                             AccountDataService, ContentDataService, SessionService) {
        if (typeof globalUserData === "undefined" ) {
            $state.go('tab.read');
        }
        $scope.router = SessionService.routeUtil;

        $scope.viewModel = {
            isBusy:false,
            opmlList : []
        };

        $scope.viewModel.isBusy = true;

        ContentDataService.listStarFeed().then(
            function(){
                $scope.viewModel.isBusy = false;
                $scope.viewModel.opmlsList = globalUserData.StarOpml;
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