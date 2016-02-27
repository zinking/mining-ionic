angular.module('mining.content')
    .controller('OpmlStarListCtrl', function($scope, $ionicLoading, $state, $ionicPopup, $ionicPopover,
                                             AccountDataService, ContentDataService, SessionService, UserDataModel) {
        $scope.viewModel = {
            isBusy:false,
            //totalUnReadCount: 0,
            omplsList : []
        };

        if (typeof globalUserData === "undefined") {
            $state.go('tab.contents');
            return;
        }

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

        $scope.openOpmlFeed = function ( fo ){
            $state.go('feed',{opmlFeed:fo});
        };

        $scope.openAddPanel = function (){
            $state.go('source');
        };

        $scope.openAddFeed = function(){
            $state.go('addfeed');
        };

        $scope.openBulkFeed = function(){
            $state.go('bulkfeed');
            $scope.closePopover();
        };

    });