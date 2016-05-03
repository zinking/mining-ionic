angular.module('mining.content')
    .controller('ReadFeedCtrl', function($scope, $filter, $ionicLoading,$state,$stateParams,$ionicPopover,$ionicPopup,
                                     $ionicScrollDelegate, $q, ContentDataService, AccountDataService, SessionService) {
        SessionService.refreshIfExpired();
        $scope.router = SessionService.routeUtil;

        $scope.viewModel = {
            stories : [],
            opml : {},
            isBusy : false,
            hasMoreStories : true
        };

        if (typeof globalUserData === "undefined" || $stateParams.opml == null) {
            $scope.router.goReadTab();
            return;
        }


        $scope.toggleReadFilter = function() {
            $scope.viewModel.opml.filterHasRead = !$scope.viewModel.opml.filterHasRead;
        };

        $scope.goBackToTab = function(){
            if (SessionService.isUrlStartWithMine($scope.viewModel.opml.XmlUrl)) {
                $scope.router.goFollowTab();
            } else {
                $scope.router.goReadTab();
            }
            //$scope.rememberScrollPos();
            //return is necessary here to prevent execution of invalid block
        };


        $scope.viewModel.opml = $stateParams.opml;
        $scope.viewModel.source = $stateParams.source;


        var READ_FEED_POPUP_TEMPLATE = 'js/content/directives/templates/ReadFeedPopMenu.html';
        SessionService.injectPopUpDiaglog(READ_FEED_POPUP_TEMPLATE, $scope);

        $scope.unSubscribeFeed = function(){
            var confirmPopup = $ionicPopup.confirm({
                title: 'UnSubscribe',
                template: 'Confirm UnSubscribe?'
            });

            confirmPopup.then(function(res) {
                if(res) {
                    $scope.doUnSubscribeFeed();
                }
            });
        };

        $scope.doUnSubscribeFeed = function(){
            var feedUrl = $scope.viewModel.opml.XmlUrl;
            $scope.viewModel.isBusy = true;
            SessionService.apiCall(
                'UnSubscribe Feed',
                ContentDataService.removeFeedSource(feedUrl),
                function() {
                    $scope.viewModel.isBusy = false;
                    $state.go('tab.read')
                },
                function() {
                    $scope.viewModel.isBusy = false;
                }
            );
        };

        $scope.markFeedsRead = function() {
            var feedUrls = $scope.viewModel.opml.getFeedsUrls();
            var feedIds = _.map(feedUrls, function(feedUrl){
                var feed = globalUserData.FeedsMap[feedUrl];
                return feed.Id;
            });
            $scope.viewModel.isBusy = true;

            SessionService.apiCall(
                'Mark Feed S Read',
                ContentDataService.markFeedsRead(feedIds),
                function() {
                    $scope.viewModel.isBusy = false;
                    //globalUserData.markFeedsStoriesRead(feedUrls);
                    $scope.viewModel.opml.markRead();
                    $scope.popover.remove();
                },
                function() {
                    $scope.viewModel.isBusy = false;
                }
            );
        };


        $scope.openStory = function (story) {
            $scope.router.goReadStory(story);
        };


    });