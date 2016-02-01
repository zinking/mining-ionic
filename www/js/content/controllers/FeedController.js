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
                    content0 : $scope.story.Summary,
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
                $scope.expand = function(){
                    $scope.loadStoryContent($scope.story, function(){
                        $scope.viewModel.content1 = $scope.story.Content.substring(0,1000);
                        $scope.viewModel.content2 = $scope.story.Content;
                        $scope.viewModel.level = ($scope.viewModel.level+1)%3;
                        $scope.$broadcast('scroll.resize');
                    });
                };
                $scope.collapse = function(){
                    $scope.viewModel.level = 0;
                };
            }
        }
    }])
    .controller('FeedCtrl', function($scope, $ionicLoading,$state,$stateParams,$ionicPopover,$ionicPopup,
                                     ContentDataService, AccountDataService, SessionService) {
        $scope.viewModel = {
            stories : [],
            opmlFeed : {},
            isBusy : false,
            hasMoreStories : true,
            currentPage : 0
        };

        if ($stateParams.opmlFeed == null ){
            $state.go('tab.contents')
        }
        var opmlFeed = $stateParams.opmlFeed;
        $scope.viewModel.opmlFeed = opmlFeed;
        $scope.viewModel.opmlFeed.currentPage = opmlFeed.currentPage;

        $scope.viewModel.stories = globalUserData.getStoriesByOpml(opmlFeed);


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

        $scope.loadMoreStories = function(){
            var feedUrl = $scope.viewModel.opmlFeed.XmlUrl;
            $scope.viewModel.isBusy = true;
            //console.log("stories before: ", $scope.viewModel.stories);
            ContentDataService.loadMoreStories(feedUrl,$scope.viewModel.currentPage+1).then(
                function(data){
                    $scope.viewModel.isBusy = false;
                    if (data.error!=null){
                        $ionicPopup.alert({
                            title: 'load more stories encountered issue',
                            subtitle:data.error
                        });
                    }
                    else{
                        //{Cursor,Stories,Star}
                        $scope.viewModel.currentPage += 1;
                        var newStories = globalUserData.addStories(data.Stories);
                        if (newStories.length>0) {
                            //$scope.viewModel.stories = $scope.viewModel.stories.concat(newStories);
                            //console.log("stories after: ", $scope.viewModel.stories);
                            //console.log("delta trimmed stories to be added:", newStories);
                            $scope.$broadcast('scroll.infiniteScrollComplete');
                            $scope.$broadcast('scroll.resize');
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

        $scope.openStory = function (index){
            var s = $scope.viewModel.stories[index];
            $state.go('story',{story:s,opmlFeed: $scope.viewModel.opmlFeed})
        };

        $scope.goToOpmlList = function(){
            $state.go('tab.contents')
        };

    });