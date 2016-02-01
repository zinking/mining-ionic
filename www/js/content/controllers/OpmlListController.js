angular.module('mining.content')
    .controller('OpmlListCtrl', function($scope, $ionicLoading,$state,$ionicPopup, AccountDataService,
                                         ContentDataService, SessionService, UserDataModel) {
        $scope.viewModel = {
            isBusy:false,
            omplsList : []
        };

        //verify user credential exists
        var userAuthData = AccountDataService.getUserData();
        if( userAuthData == null ){
            $state.go('login');
        }
        else{
            //create a global userdata structure
            globalUserData = new UserDataModel();
            globalUserData.setUserAuth(userAuthData);
        }

        $scope.viewModel.isBusy = true;
        ContentDataService.listFeed().then(
            function(){
                $scope.viewModel.isBusy = false;
                var opmlList = globalUserData.Opmls;
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
                $scope.viewModel.opmlsList = globalUserData.Opmls;
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