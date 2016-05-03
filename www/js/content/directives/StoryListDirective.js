angular.module('mining.content')
    .directive('storylist', ['$compile', '$q', '$filter', '$ionicScrollDelegate', 'ContentDataService', 'SessionService',
        function($compile, $q, $filter,  $ionicScrollDelegate, ContentDataService, SessionService) {
        return {
            restrict: 'E',
            templateUrl: 'js/content/directives/templates/StoryList.html',
            replace: true,
            transclude: true,
            scope: {
                opml: '=',
                isBusy: '=',
                onFeedStoryClicked: '&'
            },
            controller: function($scope) {
                //TODO: I feel this page requires refactoring
                $scope.viewModel = {
                    stories : [],
                    opml : {},
                    hasMoreStories : true
                };

                $scope.viewModel.opml = $scope.opml;

                $scope.onStoryItemClicked = function (index){
                    var currentStories = $filter('filterRead')(
                        $scope.viewModel.stories,
                        $scope.opml.filterHasRead
                    );
                    var s = currentStories[index];
                    $scope.rememberScrollPos();
                    //$scope.router.goReadStory($scope.viewModel.opml,s);
                    $scope.onFeedStoryClicked({story:s});
                };

                //SECTION STORY LOADING


                function generalLoadRequestedStories(feedUrls, pageNo) {
                    var feedUrl = feedUrls[0]; //take one sample
                    if (!SessionService.isUrlStartWithMine(feedUrl)) {
                        return ContentDataService.loadMoreStories(feedUrls,pageNo);
                    } else {
                        return ContentDataService.loadMoreStarStories(feedUrls,pageNo);
                    }
                }

                $scope.loadRequestedStories = function(opml, pageToLoad){
                    var feedUrls = opml.getFeedsUrls();
                    $scope.isBusy = true;
                    var deferred = $q.defer();
                    SessionService.apiCall(
                        'Load Request Stories',
                        generalLoadRequestedStories(feedUrls, pageToLoad),
                        function(data) {
                            $scope.isBusy = false;
                            //{Cursor,Stories,Star}
                            var newStories = globalUserData.addStories(
                                data.Stories,
                                data.UserReadStoryIds,
                                data.UserStarStoryIds
                            );

                            if (newStories.length == 0){
                                $scope.viewModel.hasMoreStories = false;
                                data.status = 'LAST_PAGE';
                                data.feedUrls = feedUrls;
                                deferred.resolve(data);
                            } else {
                                deferred.resolve(data);
                            }
                        },
                        function() {
                            $scope.isBusy = false;
                            deferred.reject();
                        }
                    );
                    return deferred.promise;
                };


                $scope.loadMoreStories = function() {
                    var opml = $scope.viewModel.opml;
                    var pageToLoad = opml.currentPage+1;
                    $scope.loadRequestedStories(opml,pageToLoad).then(
                        function(data){
                            if (data.status != 'LAST_PAGE') {
                                opml.currentPage+=1;
                            }
                            $scope.viewModel.stories = opml.getStories();
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                            $scope.$broadcast('scroll.resize');
                        },
                        function(){
                            //oops, you didn't flip the page
                        }
                    )
                };


                $scope.scrollToLastRemembered = function() {
                    if (typeof $scope.viewModel.opml.lastPos !== "undefined") {
                        var lastPos = $scope.viewModel.opml.lastPos;
                        setTimeout(function() { //has no clue why this is needed
                            $ionicScrollDelegate.scrollTo(lastPos.left, lastPos.top);
                        },10);
                    }
                };

                $scope.displayCurrentStories = function() {
                    $scope.viewModel.pageLoaded = true;
                    var opml = $scope.viewModel.opml;
                    var pageToLoad = opml.currentPage;
                    var cachedStories = opml.getStories();
                    if (cachedStories.length>0) {
                        $scope.viewModel.stories = cachedStories;
                        $scope.scrollToLastRemembered();
                    } else {
                        //if requested current page is not downloaded yet
                        $scope.loadRequestedStories(opml,pageToLoad).then(
                            function(){
                                $scope.viewModel.stories = opml.getStories();
                                $scope.scrollToLastRemembered();
                            },
                            function(){
                                //oops, you didn't flip the page
                            }
                        );
                    }
                };


                $scope.rememberScrollPos = function() {
                    $scope.viewModel.opml.lastPos = $ionicScrollDelegate.getScrollPosition();
                };

                //need to bring up current stories when loading the page
                if (typeof globalUserData !== "undefined" && typeof $scope.viewModel.opml !== "undefined") {
                    $scope.displayCurrentStories();
                }

            }
        }
    }]);