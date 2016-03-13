angular.module('mining.content')
    .directive('story', ['$compile', 'ContentDataService', function($compile, ContentDataService) {
        return {
            restrict: 'E',
            templateUrl: 'story-template.html',
            replace: true,
            transclude: true,
            scope: {
                story: '=story',
                open: '&'
            },
            controller: function($scope, $element) {
                $scope.viewModel = {
                    isBusy : false,
                    level : 0,
                    content0 : "",
                    content1 : "",
                    content2 : ""
                };
                $scope.loadStoryContent = function(story, callback){
                    //first try local cache
                    var storyId = $scope.story.Id;
                    var storyLink = $scope.story.Link;
                    var localContent = globalUserData.getStoryContentById(storyId);
                    if( localContent !== null ){
                        $scope.story.Content = localContent;
                    }
                    else{
                        $scope.viewModel.isBusy = true;
                        ContentDataService.loadStoryContentFromServer([storyId]).then(
                            function(){
                                $scope.viewModel.isBusy = false;
                                $scope.story.Content = globalUserData.getStoryContentById(storyId);
                                if ($scope.story.Content==""){
                                    $scope.story.Content=$scope.story.Summary
                                }

                                callback();
                            },
                            function(){
                                $scope.viewModel.isBusy = false;
                                $ionicPopup.alert({
                                    title: 'Loading Story Failed.'
                                });
                            }
                        )
                    }
                };

                function hasContent() {
                    var content = $scope.story.Content;
                    return typeof content === "undefined" && content != null && content !== "";
                }

                $scope.expand = function(){
                    if (!hasContent()) {
                        $scope.loadStoryContent($scope.story, function(){
                            $scope.viewModel.content0 = $scope.story.Content.substring(0,400);
                            $scope.viewModel.content1 = $scope.story.Content.substring(0,1000);
                            $scope.viewModel.content2 = $scope.story.Content;
                            $scope.viewModel.level = ($scope.viewModel.level+1)%3;
                            $scope.$broadcast('scroll.resize');
                        });
                    } else {
                        $scope.viewModel.content0 = $scope.story.Content.substring(0,400);
                        $scope.viewModel.content1 = $scope.story.Content.substring(0,1000);
                        $scope.viewModel.content2 = $scope.story.Content;
                        $scope.viewModel.level = ($scope.viewModel.level+1)%3;
                        $scope.$broadcast('scroll.resize');
                    }

                };
                $scope.collapse = function(){
                    $scope.viewModel.level = 0;
                };
            }
        }
    }])
    .filter('filterRead', function(){
        return function (stories, filterRead) {
            var filtered = [];
            for (var i = 0; i < stories.length; i++) {
                var story = stories[i];
                if (!(story.isRead&&filterRead)){
                    filtered.push(story);
                }
            }
            return filtered;
        };
    })
    .controller('FeedCtrl', function($scope, $ionicLoading,$state,$stateParams,$ionicPopover,$ionicPopup,
                                     $ionicScrollDelegate, ContentDataService, AccountDataService, SessionService) {
        $scope.viewModel = {
            stories : [],
            opmlFeed : {},
            isBusy : false,
            filterHasRead: false,
            hasMoreStories : true
        };

        function isUrlStartWithMine(xmlUrl) {
            var mineUrl = "http://readmine.co";
            var xmlUrlPre = xmlUrl.substring(0, mineUrl.length);
            return (xmlUrlPre === mineUrl)
        }

        $scope.toggleReadFilter = function() {
            $scope.viewModel.filterHasRead = !$scope.viewModel.filterHasRead;
        };

        $scope.goHome = function(){
            if (isUrlStartWithMine($scope.viewModel.opmlFeed.XmlUrl)) {
                $state.go('tab.stars');
            } else {
                $state.go('tab.contents');
            }
            $scope.rememberScrollPos();
            //return is necessary here to prevent execution of invalid block
            return;
        };

        if (typeof globalUserData === "undefined" || $stateParams.opmlFeed == null) {
            $state.go('tab.contents');
            return;
        }

        var opmlFeed = $stateParams.opmlFeed;
        $scope.viewModel.opmlFeed = opmlFeed;


        /* pop over setup section*/
        $ionicPopover.fromTemplateUrl('feed-menu-popover.html', {
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

        $scope.removeFeedSource = function(){
            var confirmPopup = $ionicPopup.confirm({
                title: 'UnSubscribe',
                template: 'Are you sure you want to UnSubscribe?'
            });

            confirmPopup.then(function(res) {
                if(res) {
                    $scope.doRemoveFeedSource();
                }
            });
        };

        $scope.doRemoveFeedSource = function(){
            var feedUrl = $scope.viewModel.opmlFeed.XmlUrl;
            $scope.viewModel.isBusy = true;
            ContentDataService.removeFeedSource(feedUrl).then(
                function(data){
                    $scope.viewModel.isBusy = false;
                    if (data.error!=null){
                        $ionicPopup.alert({
                            title: 'UnSubscribe Feed issue',
                            subtitle:data.error
                        });
                    }
                    else{
                        $ionicPopup.alert({
                            title: data.data
                        });
                        $state.go('tab.contents')
                    }
                },
                function(){
                    $scope.viewModel.isBusy = false;
                    $ionicPopup.alert({
                        title: 'UnSubscribe Faild, retry later'
                    });
                }
            )
        };

        $scope.markFeedsRead = function() {
            var feedUrls = $scope.viewModel.opmlFeed.getFeedsUrls();
            var feedIds = _.map(feedUrls, function(feedUrl,i){
                var feed = globalUserData.FeedsMap[feedUrl];
                var feedId = feed.Id;
                return feedId;
            });
            $scope.viewModel.isBusy = true;

            ContentDataService.markFeedsRead(feedIds).then(
                function(data){
                    if (data.error!=null){
                        $scope.viewModel.isBusy = false;
                        console.info("mark feeds read failed ", feedId, storyId, data.error);
                        $ionicPopup.alert({
                            title: 'mark feeds read failed',
                            subtitle:data.error
                        });
                    } else {
                        $scope.viewModel.isBusy = false;
                        globalUserData.markFeedsStoriesRead(feedUrls);
                        $scope.popover.remove();
                    }
                },
                function(){
                    console.info("mark feeds read failed with exception ");
                    $ionicPopup.alert({
                        title: 'mark feeds read failed with exception',
                        subtitle:"retry later"
                    });
                }
            )
        };

        //to be deprecated
        $scope.markFeedRead = function() {
            var feedUrl = $scope.viewModel.opmlFeed.XmlUrl;
            var feed = globalUserData.FeedsMap[feedUrl];
            var feedId = feed.Id;
            ContentDataService.markFeedRead(feedId).then(
                function(data){
                    if (data.error!=null){
                        console.info("mark feed read failed ", feedId, storyId, data.error);
                        $ionicPopup.alert({
                            title: 'mark feed read failed',
                            subtitle:data.error
                        });
                    } else {
                        globalUserData.markFeedStoriesRead(feedUrl);
                        $scope.popover.remove();
                    }
                },
                function(){
                    console.info("mark feed read failed with exception ");
                    $ionicPopup.alert({
                        title: 'mark feed read failed with exception',
                        subtitle:"retry later"
                    });
                }
            )
        };

        function generalLoadMoreStories(feedUrls, pageNo) {
            var feedUrl = feedUrls[0]; //take one sample
            if (!isUrlStartWithMine(feedUrl)) {
                return ContentDataService.loadMoreStories(feedUrls,pageNo);
            } else {
                return ContentDataService.loadMoreStarStories(feedUrls,pageNo);
            }
        }

        $scope.loadMoreStories = function(){
            var requestPageNo = $scope.viewModel.opmlFeed.currentPage;
            var feedUrls = $scope.viewModel.opmlFeed.getFeedsUrls();
            $scope.viewModel.isBusy = true;
            generalLoadMoreStories(feedUrls, requestPageNo).then(
                function(data){
                    $scope.viewModel.isBusy = false;
                    if (data.error != null){
                        $ionicPopup.alert({
                            title: 'load more stories encountered issue',
                            subtitle:data.error
                        });
                    }
                    else{
                        //{Cursor,Stories,Star}
                        $scope.viewModel.opmlFeed.currentPage = requestPageNo+1;
                        var newStories = globalUserData.addStories(
                            data.Stories,
                            data.UserReadStoryIds,
                            data.UserStarStoryIds
                        );
                        $scope.viewModel.stories = globalUserData.getStoriesByOpml(opmlFeed);
                        if (newStories.length>0) {
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                            $scope.$broadcast('scroll.resize');
                            $scope.scrollToLastRemembered();
                        } else {
                            $scope.viewModel.hasMoreStories = false;
                        }

                    }
                },
                function(){
                    $scope.viewModel.isBusy = false;
                    $ionicPopup.alert({
                        title: 'load more storis Faild, retry later'
                    });
                }
            )
        };

        $scope.scrollToLastRemembered = function() {
            if (typeof $scope.viewModel.opmlFeed.lastPos !== "undefined") {
                var lastPos = $scope.viewModel.opmlFeed.lastPos;
                $ionicScrollDelegate.scrollTo(lastPos.left, lastPos.top);
            }
        };


        $scope.displayCurrentStories = function() {
            $scope.viewModel.pageLoaded = true;
            var feedUrls = $scope.viewModel.opmlFeed.getFeedsUrls();
            var requestPageNo = $scope.viewModel.opmlFeed.currentPage;
            var cachedStories = globalUserData.getLocalStories(feedUrls, requestPageNo);
            if (cachedStories.length>0) {
                //console.log("intial loadded stories:",cachedStories.length);
                $scope.viewModel.stories = $scope.viewModel.stories.concat(cachedStories);
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.$broadcast('scroll.resize');
                $scope.scrollToLastRemembered();
                return;
            } else {
                //console.log("intial loadded need request stories:",requestPageNo);
                $scope.loadMoreStories();
            }
        };

        //need to bring up current stories when loading the page
        $scope.displayCurrentStories();



        $scope.rememberScrollPos = function() {
            var scrollPos = $ionicScrollDelegate.getScrollPosition();
            $scope.viewModel.opmlFeed.lastPos = scrollPos;
        };


        $scope.openStory = function (index){
            var s = $scope.viewModel.stories[index];
            $scope.rememberScrollPos();
            $state.go('story',{story:s,opmlFeed: $scope.viewModel.opmlFeed})
        };

    });