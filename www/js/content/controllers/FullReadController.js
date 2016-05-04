angular.module('mining.content')
    .controller('NavController', function($scope, $ionicSideMenuDelegate) {
        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };
    })
    .controller('FullReadCtrl', function(
        $scope, $ionicLoading, $state, $ionicPopup, $ionicPopover,$ionicSideMenuDelegate, $timeout, AccountDataService,
        ContentDataService, SessionService, UserDataModel
    ) {

        $scope.router = SessionService.routeFullUtil;


        $scope.viewModel = {
            isBusy:false,
            totalUnReadCount: 0,
            opmlList : []
        };

        //verify user credential exists
        var userAuthData = AccountDataService.getUserData();
        if( userAuthData == null ){
            $state.go('login');
            return;
        }
        else{
            //create a global user data structure
            window.globalUserData = new UserDataModel();
            globalUserData.setUserAuth(userAuthData);
        }

        $scope.viewModel.user = userAuthData;

        $scope.viewModel.isBusy = true;
        $scope.viewModel.totalUnReadCount = globalUserData.totalUnReadCount;

        SessionService.apiCall(
            'Load Feeds',
            ContentDataService.listFeed(),
            function(){
                $scope.viewModel.isBusy = false;
                $scope.viewModel.opmlsList = globalUserData.Opml;
                $scope.viewModel.totalUnReadCount = globalUserData.totalUnReadCount;

                $ionicSideMenuDelegate.toggleLeft();
                $scope.router.goReadFeed($scope.viewModel.opmlsList[1]);
            },
            function(){
                $scope.viewModel.isBusy = false;
                ContentDataService.loadLocalUserData();
                $scope.viewModel.opmlsList = globalUserData.Opml;


            }
        );


    });