angular.module('mining.content')
.controller('ReadStoryCtrl', function($scope, $sce, $ionicLoading, $state,$stateParams,$ionicPopup,
                                      ContentDataService, SessionService) {

        SessionService.refreshIfExpired();
        $scope.router = SessionService.routeUtil;

        $scope.viewModel = {
            story : {},
            isBusy : false,
            startTimeStamp: 0
        };


        if (typeof globalUserData === "undefined" || typeof $stateParams.story === "undefined") {
            $scope.router.goHome();
            return;
        }

        $scope.viewModel.story = $stateParams.story;
        $scope.viewModel.opml = $stateParams.story.feed.opml;


        $scope.viewModel.startTimeStamp = new Date().getTime();

        $scope.goToFeed = function(){
            var endTimeStamp = new Date().getTime();
            var duration = endTimeStamp - $scope.viewModel.startTimeStamp;

            globalUserData.appendUserStats(
                $scope.viewModel.startTimeStamp,
                'READ_STORY',
                $scope.viewModel.story.FeedId,
                $scope.viewModel.story.Id,
                'Duration:'+duration
            );
            $scope.router.goReadFeed($scope.viewModel.opml);
        };



        $scope.markStoryStar = function() {
            if ($scope.viewModel.story.isStar==true) {
                return;
            }
            var storyId = $scope.viewModel.story.Id;
            var feedId = $scope.viewModel.story.FeedId;
            SessionService.apiCall(
                'Star Story',
                ContentDataService.markStoryStar(feedId,storyId),
                function() {
                    //globalUserData.markStoryStar($scope.viewModel.story);
                    $scope.viewModel.story.markStar();
                },
                function() {

                }
            );
        };


    });