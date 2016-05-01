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
    .directive('story', ['$compile', 'ContentDataService', function($compile, ContentDataService) {
        return {
            restrict: 'E',
            templateUrl: 'js/content/directives/templates/Story.html',
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
                    content0 : "",
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
                                if (!$scope.story.hasContent()){
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