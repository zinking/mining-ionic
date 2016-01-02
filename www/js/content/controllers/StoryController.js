angular.module('mining.content')
    .controller('StoryCtrl', function($scope, $ionicLoading, $state,$stateParams,$ionicPopup,
                                      ContentDataService, SessionService) {
        $scope.viewModel = {
            story : {},
            opmlFeed : {},
            storyContent : ""
        };

        if ($stateParams.story==null || $stateParams.opmlFeed==null){
            $state.go('tab.contents')
        }

        $scope.viewModel.story = $stateParams.story;
        $scope.viewModel.opmlFeed = $stateParams.opmlFeed;

        $scope.goToFeed = function(){
            $state.go('feed',{opmlFeed:$scope.viewModel.opmlFeed})
        }

        $scope.loadStoryContent = function(story){
            //first try local cache
            var storyId = $scope.viewModel.story.Id;
            var storyLink = $scope.viewModel.story.Link;
            var localContent = ContentDataService.loadStoryContentFromCache(storyLink);
            if( localContent !== null ){
                $scope.viewModel.story.Content = localContent;
            }
            else{
                ContentDataService.loadStoryContentFromServer([storyId]).then(
                    function(){
                        $scope.viewModel.story.Content = miningUserData.storylink2ContentMap[storyId];
                    },
                    function(){
                        $ionicPopup.alert({
                            title: 'Loading Story Failed.'
                        });
                    }
                )
            }
        }

        $scope.loadStoryContent( $scope.viewModel.story )
    });