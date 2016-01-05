angular.module('mining.content')
    .controller('OpmlFeedSideCtrl', function($scope, $ionicLoading,$state,$ionicSideMenuDelegate,$ionicPopup,
                                         AccountDataService,
                                         ContentDataService,
                                         SessionService) {
        $scope.viewModel = {
            omplsList : null,
            stories : [],
            isBusy : false,
            opmlFeed :{}
        };

        //verify user credential exists
        var userData = AccountDataService.getUserData();
        if( userData == "" ){
            $state.go('login');
        }
        else{
            //create a global userdata structure
            miningUserData = userData;
            miningUserData.storylink2ContentMap = {}

        }



        ContentDataService.listFeed().then(
            function(){
                var opmlList = miningUserData.OpmlsList;
                _.each(opmlList, function(opml){
                    opml.isFolder = 'Outline' in opml;
                    opml.isOpen = false;
                })
                $scope.viewModel.opmlsList = opmlList
                //
                var opmlFeed = opmlList[0];
                $scope.viewModel.opmlFeed = opmlFeed;
                loadOpmlFeedContent(opmlFeed);
            },
            function(){
                $ionicPopup.alert({
                    title: 'Loading Failed,fallback on cache'
                });
                ContentDataService.localLoadCachedListFeed();
                $scope.viewModel.opmlsList = miningUserData.OpmlsList;
            }
        )



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
                feedTitle = feedTitle+Array(len-feedTitle.length).join(" ");
            }
            feed.fTitle = feedTitle;
        }


        function loadOpmlFeedContent(opmlFeed){
            if( "Outline" in opmlFeed ){
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
                var feedStories = miningUserData.StoriesMap[feedXmlUrl]
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
        }

        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        }


    });