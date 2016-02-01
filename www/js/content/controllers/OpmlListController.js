angular.module('mining.content')
    .controller('OpmlListCtrl', function($scope, $ionicLoading,$state,$ionicPopup,
                                         AccountDataService,
                                         ContentDataService,
                                         SessionService) {
        $scope.viewModel = {
            isBusy:false,
            omplsList : null
        };

        //verify user credential exists
        var userData = AccountDataService.getUserData();
        if( userData == "" ){
            $state.go('login');
        }
        else{
            //create a global userdata structure
            miningUserData = userData;
            miningUserData.storylink2ContentMap = {}

        }

        $scope.viewModel.isBusy = true;
        ContentDataService.listFeed().then(
            function(){
                $scope.viewModel.isBusy = false;
                var opmlList = miningUserData.OpmlsList;
                _.each(opmlList, function(opml){
                    opml.isFolder = 'Outline' in opml;
                    opml.isOpen = false;
                });
                $scope.viewModel.opmlsList = opmlList
            },
            function(){
                $scope.viewModel.isBusy = false;
                $ionicPopup.alert({
                    title: 'Loading Failed,fallback on cache'
                });
                ContentDataService.loadCachedListFeed();
                $scope.viewModel.opmlsList = miningUserData.OpmlsList;
            }
        );

        $scope.openOpmlFeed = function ( fo ){
            $state.go('feed',{opmlFeed:fo})
        };

        $scope.openAddPanel = function (){
            $state.go('source')
        };

        $scope.openAddFeed = function(){
            $state.go('addfeed')
        };

    });