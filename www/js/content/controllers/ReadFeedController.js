angular.module('mining.content')
    .controller('ReadFeedCtrl', function($scope, $filter, $ionicLoading,$state,$stateParams,$ionicPopover,$ionicPopup,
                                     $ionicScrollDelegate, $q, ContentDataService, AccountDataService, SessionService) {
        SessionService.refreshIfExpired();
        $scope.router = SessionService.routeUtil;

        $scope.viewModel = {
            stories : [],
            opmlFeed : {},
            isBusy : false,
            source : '', //indicating coming from which page
            hasMoreStories : true
        };

        if (typeof globalUserData === "undefined" || $stateParams.opmlFeed == null) {
            $scope.router.goReadTab();
            return;
        }

        function isUrlStartWithMine(xmlUrl) {
            var mineUrl = "http://readmine.co/users";
            var xmlUrlPre = xmlUrl.substring(0, mineUrl.length);
            return (xmlUrlPre === mineUrl)
        }

        $scope.toggleReadFilter = function() {
            $scope.viewModel.opmlFeed.filterHasRead = !$scope.viewModel.opmlFeed.filterHasRead;
        };

        $scope.goBackToTab = function(){
            if (isUrlStartWithMine($scope.viewModel.opmlFeed.XmlUrl)) {
                $scope.router.goFollowTab();
            } else {
                $scope.router.goReadTab();
            }
            $scope.rememberScrollPos();
            //return is necessary here to prevent execution of invalid block
            return;
        };



        $scope.viewModel.opmlFeed = $stateParams.opmlFeed;
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
            var feedUrl = $scope.viewModel.opmlFeed.XmlUrl;
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
            var feedUrls = $scope.viewModel.opmlFeed.getFeedsUrls();
            var feedIds = _.map(feedUrls, function(feedUrl,i){
                var feed = globalUserData.FeedsMap[feedUrl];
                return feed.Id;
            });
            $scope.viewModel.isBusy = true;

            SessionService.apiCall(
                'Mark Feed S Read',
                ContentDataService.markFeedsRead(feedIds),
                function() {
                    $scope.viewModel.isBusy = false;
                    globalUserData.markFeedsStoriesRead(feedUrls);
                    $scope.popover.remove();
                },
                function() {
                    $scope.viewModel.isBusy = false;
                }
            );
        };


        function generalLoadRequestedStories(feedUrls, pageNo) {
            var feedUrl = feedUrls[0]; //take one sample
            if (!isUrlStartWithMine(feedUrl)) {
                return ContentDataService.loadMoreStories(feedUrls,pageNo);
            } else {
                return ContentDataService.loadMoreStarStories(feedUrls,pageNo);
            }
        }

        $scope.loadRequestedStories = function(opmlFeed, pageToLoad){
            var feedUrls = [];
            if (opmlFeed.Type == "RSS/ALL") {
                feedUrls = globalUserData.getAllFeedXmlUrls();
            } else {
                feedUrls = opmlFeed.getFeedsUrls();
            }
            $scope.viewModel.isBusy = true;
            var deferred = $q.defer();
            SessionService.apiCall(
                'Load Request Stories',
                generalLoadRequestedStories(feedUrls, pageToLoad),
                function(data) {
                    $scope.viewModel.isBusy = false;
                    //{Cursor,Stories,Star}
                    var newStories = globalUserData.addStories(
                        data.Stories,
                        data.UserReadStoryIds,
                        data.UserStarStoryIds
                    );

                    if (data.Stories.length == 0){
                        // if no data
                        $scope.viewModel.hasMoreStories = false;
                        data.status = 'LAST_PAGE';
                        data.feedUrls = feedUrls;
                        deferred.resolve(data);
                    } else {
                        deferred.resolve(data);
                    }
                },
                function() {
                    $scope.viewModel.isBusy = false;
                    deferred.reject();
                }
            );
            return deferred.promise;
        };


        $scope.loadMoreStories = function() {
            var opmlFeed = $scope.viewModel.opmlFeed;
            var pageToLoad = opmlFeed.currentPage+1;
            $scope.loadRequestedStories(opmlFeed,pageToLoad).then(
                function(data){
                    if (data.status != 'LAST_PAGE') {
                        opmlFeed.currentPage+=1;
                    }
                    $scope.viewModel.stories = globalUserData.getStoriesByOpml(opmlFeed);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $scope.$broadcast('scroll.resize');
                },
                function(){
                    //oops, you didn't flip the page
                }
            )
        };


        $scope.scrollToLastRemembered = function() {
            if (typeof $scope.viewModel.opmlFeed.lastPos !== "undefined") {
                var lastPos = $scope.viewModel.opmlFeed.lastPos;
                setTimeout(function() { //has no clue why this is needed
                    $ionicScrollDelegate.scrollTo(lastPos.left, lastPos.top);
                },10);
            }
        };


        $scope.displayCurrentStories = function() {
            $scope.viewModel.pageLoaded = true;
            var opmlFeed = $scope.viewModel.opmlFeed;
            var feedUrls = opmlFeed.getFeedsUrls();
            var pageToLoad = opmlFeed.currentPage;
            var cachedStories = globalUserData.getStoriesByOpml(opmlFeed);
            if (cachedStories.length>0) {
                $scope.viewModel.stories = globalUserData.getStoriesByOpml(opmlFeed);
                $scope.scrollToLastRemembered();

                return;
            } else {
                //if requested current page is not downloaded yet
                $scope.loadRequestedStories(opmlFeed,pageToLoad).then(
                    function(data){
                        $scope.viewModel.stories = globalUserData.getStoriesByOpml(opmlFeed);
                        $scope.scrollToLastRemembered();
                    },
                    function(){
                        //oops, you didn't flip the page
                    }
                );
                return;
            }
        };

        //need to bring up current stories when loading the page
        $scope.displayCurrentStories();

        $scope.rememberScrollPos = function() {
            var scrollPos = $ionicScrollDelegate.getScrollPosition();
            $scope.viewModel.opmlFeed.lastPos = scrollPos;
        };


        $scope.openStory = function (index){
            var currentStories = $filter('filterRead')(
                $scope.viewModel.stories,
                $scope.viewModel.opmlFeed.filterHasRead
            );
            var s = currentStories[index];
            $scope.rememberScrollPos();
            $scope.router.goReadStory($scope.viewModel.opmlFeed,s);
        };

    });