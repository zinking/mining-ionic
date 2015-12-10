angular.module('mining.content')
    .controller('OpmlListCtrl', function($scope, $ionicLoading,$state,
                                         AccountDataService,
                                         ContentDataService,
                                         SessionService) {
        $scope.viewModel = {
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

        ContentDataService.listFeed().then(
            function(){
                var opmlList = miningUserData.OpmlsList;
                _.each(opmlList, function(opml){
                    opml.isFolder = 'Outline' in opml;
                    opml.isOpen = false;
                })
                $scope.viewModel.opmlsList = opmlList
            },
            function(){
                $ionicPopup.alert({
                    title: 'Loading Failed,fallback on cache'
                });
                ContentDataService.loadCachedListFeed();
                $scope.viewModel.opmlsList = miningUserData.OpmlsList;
            }
        )

        $scope.openOpmlFeed = function ( fo ){
            $state.go('feed',{opmlFeed:fo})
        }

    });