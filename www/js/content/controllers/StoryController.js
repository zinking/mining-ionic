angular.module('mining.content')
    .controller('StoryCtrl', function($scope, $ionicLoading, $state,$stateParams,$ionicPopup,
                                      ContentDataService, SessionService) {
        $scope.viewModel = {
            story : {},
            opmlFeed : {},
            storyContent : ""
        };

        $scope.viewModel.story = $stateParams.story;
        $scope.viewModel.opmlFeed = $stateParams.opmlFeed;

        $scope.goToFeed = function(){
            $state.go('feed',{opmlFeed:$scope.viewModel.opmlFeed})
        }

        $scope.loadStoryContent = function(storyLink){
            //first try local cache
            var localContent = ContentDataService.loadStoryContentFromCache(storyLink);
            if( localContent !== null ){
                $scope.viewModel.story.Content = localContent;
            }
            else{
                ContentDataService.loadStoryContentFromServer([storyLink]).then(
                    function(){
                        $scope.viewModel.story.Content = miningUserData.storylink2ContentMap[storyLink];
                        var a=1;
                    },
                    function(){
                        $ionicPopup.alert({
                            title: 'Loading Story Failed.'
                        });
                    }
                )
            }
        }

        $scope.loadStoryContent( $scope.viewModel.story.Link )
    });