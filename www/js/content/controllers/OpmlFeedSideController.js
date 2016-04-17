angular.module('mining.content')
    .controller('OpmlFeedSideCtrl', function($scope, $ionicLoading,$state,$ionicSideMenuDelegate,$ionicPopup,
                                         AccountDataService, ContentDataService, SessionService) {
        $scope.viewModel = {
            omplsList : null,
            stories : [],
            isBusy : false,
            opmlFeed :{}
        };

        $scope.goHome = function(){
            $state.go('tab.contents');
            return;
        };

        if (typeof globalUserData === "undefined") {
            $scope.goHome();
            return;
        }

        ContentDataService.listFeed().then(
            function(){
                var opmlList = globalUserData.Opml;
                _.each(opmlList, function(opml){
                    opml.isFolder = 'Outline' in opml;
                    opml.isOpen = false;
                });
                $scope.viewModel.opmlsList = opmlList;
                var opmlFeed = opmlList[0];
                $scope.viewModel.opmlFeed = opmlFeed;
                loadOpmlFeedContent(opmlFeed);
            },
            function(){
                $ionicPopup.alert({
                    title: 'Loading Failed,fallback on cache'
                });
                ContentDataService.loadLocalUserData();
                $scope.viewModel.opmlsList = globalUserData.Opml;
            }
        );

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


        function loadOpmlFeedContent(opmlFeed){
            if( "Outline" in opmlFeed ){
                _.each(opmlFeed.Outline,function(feed,i){
                    //every element of outline should be opmlFeed
                    var feedStories = globalUserData.StoriesMap[feed.XmlUrl];
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
                var feedStories = globalUserData.StoriesMap[feedXmlUrl];
                fitFeedTitle(opmlFeed,30);
                _.each(feedStories, function(s,i){
                    s.feed = opmlFeed;
                    s.Summary = stripSummary(s.Summary)

                });
                $scope.viewModel.stories = feedStories;
            }
        }



        $scope.openStory = function (index){
            var s = $scope.viewModel.stories[index];
            $state.go('story',{story:s,opmlFeed: $scope.viewModel.opmlFeed})
        };

        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };


    });