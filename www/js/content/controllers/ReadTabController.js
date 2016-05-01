angular.module('mining.content')
    .controller('ReadTabCtrl', function(
        $scope, $ionicLoading, $state, $ionicPopup, $ionicPopover,deviceDetector, AccountDataService,
        ContentDataService, SessionService, UserDataModel
    ) {
        //USE different view for PC
        //if (!deviceDetector.isMobile()){
        //    //$state.go('pchome');
        //    return;
        //}

        $scope.router = SessionService.routeUtil;

        $scope.viewModel = {
            isBusy:false,
            totalUnReadCount: 0,
            omplsList : []
        };

        $ionicPopover.fromTemplateUrl('js/content/directives/templates/ReadTabPopMenu.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });


        $scope.openPopover = function($event) {
            $scope.popover.show($event);
        };
        $scope.closePopover = function() {
            $scope.popover.hide();
        };
        $scope.$on('$destroy', function() {
            $scope.popover.remove();
        });

        //verify user credential exists
        var userAuthData = AccountDataService.getUserData();
        if( userAuthData == null ){
            $state.go('login');
            return;
        }
        else{
            //create a global userdata structure
            globalUserData = new UserDataModel();
            globalUserData.setUserAuth(userAuthData);
        }

        $scope.viewModel.isBusy = true;
        $scope.viewModel.totalUnReadCount = globalUserData.totalUnReadCount;

        ContentDataService.listFeed().then(
            function(){
                $scope.viewModel.isBusy = false;
                var opmlList = globalUserData.Opml;
                _.each(opmlList, function(opml){
                    opml.isFolder = 'Outline' in opml;
                    opml.isOpen = false;
                });
                $scope.viewModel.opmlsList = opmlList;
                $scope.viewModel.totalUnReadCount = globalUserData.totalUnReadCount;
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