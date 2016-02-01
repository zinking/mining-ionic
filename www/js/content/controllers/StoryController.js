angular.module('mining.content')
    .controller('StoryCtrl', function($scope, $ionicLoading, $state,$stateParams,$ionicPopup,
                                      ContentDataService, SessionService) {
        $scope.viewModel = {
            story : {},
            isBusy : false,
            opmlFeed : {}
        };

        if ($stateParams.story==null || $stateParams.opmlFeed==null){
            $state.go('tab.contents')
        }

        $scope.viewModel.story = $stateParams.story;
        $scope.viewModel.opmlFeed = $stateParams.opmlFeed;

        $scope.goToFeed = function(){
            $state.go('feed',{opmlFeed:$scope.viewModel.opmlFeed})
        };

        $scope.loadStoryContent = function(story){
            //first try local cache
            var storyId = $scope.viewModel.story.Id;
            var storyLink = $scope.viewModel.story.Link;
            var localContent = globalUserData.getStoryContentById(storyId);
            if( localContent !== null ){
                $scope.viewModel.story.Content = localContent;
            }
            else{
                $scope.viewModel.isBusy = true;
                ContentDataService.loadStoryContentFromServer([storyId]).then(
                    function(){
                        $scope.viewModel.isBusy = false;
                        $scope.viewModel.story.Content = globalUserData.getStoryContentById(storyId);
                        if ($scope.viewModel.story.Content==""){
                            $scope.viewModel.story.Content=$scope.viewModel.story.Summary
                        }
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