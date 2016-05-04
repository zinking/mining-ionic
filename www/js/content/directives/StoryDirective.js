angular.module('mining.content')
    .directive('ngcDone', function ($timeout) {
        return function (scope, element, attrs) {
            scope.$watch(attrs.ngcDone, function (callback) {
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
    .directive('story', ['$compile','$state', 'ContentDataService','SessionService',
        function($compile, $state, ContentDataService, SessionService) {
        return {
            restrict: 'E',
            templateUrl: function() {
                var mode = 'item';
                var device = 'mobile';
                if ('mode' in $state.params) {
                    mode = $state.params.mode;
                }
                if ('device' in $state.params) {
                    device = $state.params.device;
                }
                var templateBase = 'js/content/directives/templates/';
                var templateName = 'Story'+ mode.capitalizeFirstLetter() + device.capitalizeFirstLetter();
                return templateBase + templateName + ".html";
            },
            replace: true,
            transclude: true,
            scope: {
                story: '=',
                open: '&',
                isBusy: '='

            },
            controller: function($scope) {
                $scope.viewModel = {
                    level : 0,
                    content0 : "",
                    content1 : "",
                    content2 : ""
                };

                $scope.story.expand = false;

                $scope.onContentLoaded = function() {
                    //var storyContainer = $('#story-container');
                    //storyContainer.find('img').addClass('fitContent');
                    //storyContainer.find('img').removeAttr('style');
                    //storyContainer.find('img').removeAttr('height');
                    //storyContainer.find('embed').addClass('fitContent');
                    //storyContainer.find('video').addClass('fitContent');
                    //storyContainer.find('iframe').addClass('fitContent');
                    $('#story-container img').addClass('fitContent').removeAttr('style').removeAttr('height');
                    $('#story-container embed').addClass('fitContent');
                    $('#story-container video').addClass('fitContent');
                    $('#story-container iframe').addClass('fitContent');

                };

                $scope.markStoryRead = function() {
                    if ($scope.story.isRead==true) {
                        return;
                    }
                    var storyId = $scope.story.Id;
                    var feedId = $scope.story.FeedId;
                    SessionService.apiCall(
                        'Mark Story Read',
                        ContentDataService.markStoryRead(feedId,storyId),
                        function() {
                            //TODO: issue: unread counter not decreased in all scenarios
                            //for some feed, the counter can be decreased and propogated to corresponding views
                            //but egg. bohaishibei, this is not the case.
                            //in `gud` the opml counter is decreased, but going back to feed page, the counter is resumed
                            $scope.story.markRead();
                            globalUserData.totalUnReadCount -= 1;
                        },
                        function(){

                        }
                    );
                };

                $scope.loadStoryContent = function(onSuccessCallBack){
                    //first try local cache
                    if($scope.story.hasContent()){
                        $scope.markStoryRead();
                    }
                    else{
                        $scope.isBusy = true;
                        var storyId = $scope.story.Id;
                        SessionService.apiCall(
                            'Load More Story',
                            ContentDataService.loadStoryContentFromServer([storyId]),
                            function(d) {
                                $scope.isBusy = false;

                                $scope.story.setSummary(d[0].Summary);
                                $scope.story.setContent(d[0].Content);
                                $scope.markStoryRead();
                                if (onSuccessCallBack) {
                                    onSuccessCallBack();
                                }
                            },
                            function() {
                                $scope.isBusy = false;
                            }
                        );
                    }
                };

                if (globalUserData && $state.params.mode === 'full') {
                    $scope.loadStoryContent(  )
                }


                $scope.expandStory = function(){
                    if ($state.params.mode=="expand") { //only works in expand mode
                        $scope.open(); //calling callback handler
                        $scope.story.expand = true;
                        $scope.loadStoryContent(function () {

                            $scope.$broadcast('scroll.infiniteScrollComplete');
                            $scope.$broadcast('scroll.resize');
                        });
                    }

                };

                //TODO: the attempt to incrementally preview story is not successful
                $scope.expand = function(){
                    if (!$scope.story.hasContent()) {
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
    }]);