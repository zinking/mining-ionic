angular.module('mining.content')
    .controller('StoryCtrl', function($scope, $ionicLoading, $state,$stateParams,$ionicPopup,
                                      ContentDataService, SessionService) {
        $scope.viewModel = {
            story : {},
            isBusy : false,
            opmlFeed : {}
        };

        $scope.goHome = function(){
            $state.go('tab.contents')
        };

        if (typeof globalUserData === "undefined" ||
            typeof $stateParams.story === "undefined" ||
            typeof $stateParams.opmlFeed === "undefined" ) {

            $scope.goHome();
            return;
        }

        $scope.viewModel.story = $stateParams.story;
        $scope.viewModel.opmlFeed = $stateParams.opmlFeed;

        $scope.goToFeed = function(){
            $state.go('feed',{opmlFeed:$scope.viewModel.opmlFeed})
        };

        $scope.markStoryRead = function() {
            if ($scope.viewModel.story.isRead==true) {
                return;
            }
            var storyId = $scope.viewModel.story.Id;
            var feedId = $scope.viewModel.story.FeedId;
            ContentDataService.markStoryRead(feedId,storyId).then(
                function(data){
                    if (data.error!=null){
                        console.info("mark story read failed ", feedId, storyId, data.error)
                    } else {
                        globalUserData.markStoryRead($scope.viewModel.story);
                    }
                },
                function(){
                    console.info("mark story read failed with exception ")
                }
            )
        };

        $scope.markStoryStar = function() {
            if ($scope.viewModel.story.isStar==true) {
                return;
            }
            var storyId = $scope.viewModel.story.Id;
            var feedId = $scope.viewModel.story.FeedId;
            ContentDataService.markStoryStar(feedId,storyId).then(
                function(data){
                    if (data.error!=null){
                        console.info("mark story Star failed ", feedId, storyId, data.error)
                    } else {
                        globalUserData.markStoryStar($scope.viewModel.story);
                    }
                },
                function(){
                    console.info("mark story Star failed with exception ")
                }
            )
        };

        $scope.loadStoryContent = function(story){
            //first try local cache
            var storyId = $scope.viewModel.story.Id;
            var storyLink = $scope.viewModel.story.Link;
            var localContent = globalUserData.getStoryContentById(storyId);
            if( localContent !== null && localContent !== ""){
                $scope.viewModel.story.Content = localContent;
                $scope.markStoryRead();
            }
            else{
                $scope.viewModel.isBusy = true;
                ContentDataService.loadStoryContentFromServer([storyId]).then(
                    function(){
                        $scope.viewModel.isBusy = false;
                        $scope.viewModel.story.Content = globalUserData.getStoryContentById(storyId);
                        if ($scope.viewModel.story.Content==""){
                            //var story = globalUserData.getStorySummaryById(storyId)
                            $scope.viewModel.story = globalUserData.getStoryById(storyId);
                            $scope.viewModel.story.Content=$scope.viewModel.story.Summary;
                        }
                        $scope.markStoryRead();
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

        $scope.loadStoryContent( $scope.viewModel.story )
    });