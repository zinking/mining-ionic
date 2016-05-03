angular.module('mining.content')
    .controller('ReadTabCtrl', function(
        $scope, $ionicLoading, $state, $ionicPopup, $ionicPopover,deviceDetector, AccountDataService,
        ContentDataService, SessionService, UserDataModel
    ) {
        //USE different view for PC
        //if (!deviceDetector.isMobile()){
        //    //$state.go('pcHome');
        //    return;
        //}

        $scope.router = SessionService.routeUtil;

        $scope.viewModel = {
            isBusy:false,
            totalUnReadCount: 0,
            opmlList : []
        };

        var READ_TAB_POPUP_TEMPLATE = 'js/content/directives/templates/ReadTabPopMenu.html';
        SessionService.injectPopUpDiaglog(READ_TAB_POPUP_TEMPLATE, $scope);


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

        $scope.viewModel.isBusy = true;
        $scope.viewModel.totalUnReadCount = globalUserData.totalUnReadCount;

        SessionService.apiCall(
            'Load Feeds',
            ContentDataService.listFeed(),
            function(){
                $scope.viewModel.isBusy = false;
                $scope.viewModel.opmlsList = globalUserData.Opml;
                $scope.viewModel.totalUnReadCount = globalUserData.totalUnReadCount;
            },
            function(){
                $scope.viewModel.isBusy = false;
                ContentDataService.loadLocalUserData();
                $scope.viewModel.opmlsList = globalUserData.Opml;
            }
        );
    });