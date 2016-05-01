angular.module('mining.content')
.directive('ngcDone', function ($timeout) {
    return function (scope, element, attrs) {
        scope.$watch(attrs.ngcDone, function (callback) {
            //console.log("hello there");
            if (scope.$last === undefined) {
                scope.$watch('htmlElement', function () {
                    if (scope.htmlElement !== undefined) {
                        $timeout(eval(callback), 1);
                    }
                });
            }

            if (scope.$last) {
                eval(callback)();
            }
        });
    }
})
.filter('unsafe', function($sce) { return $sce.trustAsHtml; })
.controller('ReadStoryCtrl', function($scope, $sce, $ionicLoading, $state,$stateParams,$ionicPopup,
                                      ContentDataService, SessionService) {

        SessionService.refreshIfExpired();
        $scope.router = SessionService.routeUtil;

        $scope.viewModel = {
            story : {},
            isBusy : false,
            startTimeStamp: 0,
            opmlFeed : {}
        };


        if (typeof globalUserData === "undefined" ||
            typeof $stateParams.story === "undefined" ||
            typeof $stateParams.opmlFeed === "undefined" ) {

            $scope.router.goHome();
            return;
        }

        $scope.viewModel.story = $stateParams.story;
        $scope.viewModel.opmlFeed = $stateParams.opmlFeed;


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

            $scope.router.goReadFeed($scope.viewModel.opmlFeed);
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
                        //TODO: issue: unread counter not decreased in all scenarios
                        //for some feed, the counter can be decreased and propogated to corresponding views
                        //but egg. bohaishibei, this is not the case.
                        //in `gud` the opml counter is decreased, but going back to feed page, the counter is resumed
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

        $scope.onContentLoaded = function() {
            //console.log("yeah content loaded");

            $('#storyContainer img').addClass('fitContent');
            $('#storyContainer embed').addClass('fitContent');
            $('#storyContainer video').addClass('fitContent');
            $('#storyContainer iframe').addClass('fitContent');
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
                        //TODO: oh really, loaded means read ?
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