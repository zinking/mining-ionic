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
                    var localContent = ContentDataService.loadStoryContentFromCache(storyLink);
                    if( localContent !== null ){
                        $scope.story.Content = localContent;
                    }
                    else{
                        $scope.viewModel.isBusy = true;
                        ContentDataService.loadStoryContentFromServer([storyId]).then(
                            function(){
                                $scope.viewModel.isBusy = false;
                                $scope.story.Content = miningUserData.storylink2ContentMap[storyId];
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
                        $scope.viewModel.level = ($scope.viewModel.level+1)%3
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
            opmlFeed :{},
            isBusy:false,
            feedIndex : 0
        };

        if ($stateParams.opmlFeed == null ){
            $state.go('tab.contents')
        }
        var opmlFeed = $stateParams.opmlFeed;
        $scope.viewModel.opmlFeed = opmlFeed;

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
                    console.log('You are sure to remove');
                } else {
                    console.log('You are not sure');
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


        function stripSummary(html)
        {
            var tmp = document.createElement("DIV");
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || "";
        }

        function fitFeedTitle(feed,len){
            var feedTitle = feed.Title;
            if( feedTitle.length > len ){
                feedTitle = feedTitle.substring(0,len-3) + "...";
            }
            else if( feedTitle.length < len ){
                feedTitle = feedTitle+new Array(len-feedTitle.length).join(" ");
            }
            feed.fTitle = feedTitle;
        }



        if( "Outline" in opmlFeed && opmlFeed["Outline"].length>0 ){
            _.each(opmlFeed.Outline,function(feed,i){
                //every element of outline should be opmlFeed
                var feedStories = miningUserData.StoriesMap[feed.XmlUrl];
                fitFeedTitle(feed,30);
                _.each(feedStories, function(s,i){
                    s.feed = feed;
                    s.Summary = stripSummary(s.Summary)

                });
                $scope.viewModel.stories = $scope.viewModel.stories.concat(feedStories)
            });

            _.sortBy( $scope.viewModel.stories, function(s){
                return s.Date
            })
        }
        else{
            var feedXmlUrl = opmlFeed.XmlUrl;
            var feedStories = miningUserData.StoriesMap[feedXmlUrl];
            fitFeedTitle(opmlFeed,30);
            _.each(feedStories, function(s,i){
                s.feed = opmlFeed;
                s.Summary = stripSummary(s.Summary)

            });
            $scope.viewModel.stories = feedStories;
        }


        $scope.openStory = function (index){
            var s = $scope.viewModel.stories[index];
            $state.go('story',{story:s,opmlFeed: $scope.viewModel.opmlFeed})
        };

        $scope.goToOpmlList = function(){
            $state.go('tab.contents')
        };

    });