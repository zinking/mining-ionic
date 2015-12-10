angular.module('mining.content')
    .controller('FeedCtrl', function($scope, $ionicLoading,$state,$stateParams,
                                     ContentDataService,
                                     AccountDataService, SessionService) {
        $scope.viewModel = {
            stories : [],
            opmlFeed :{},
            feedIndex : 0
        };

        //var feedIndex = $stateParams.index;
        //var opmlFeed = miningUserData.OpmlsList[feedIndex];
        var opmlFeed = $stateParams.opmlFeed;
        $scope.viewModel.opmlFeed = opmlFeed;

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



        if( "Outline" in opmlFeed ){
            _.each(opmlFeed.Outline,function(feed,i){
                //every element of outline should be opmlFeed
                var feedStories = miningUserData.StoriesMap[feed.XmlUrl];
                fitFeedTitle(feed,30);
                _.each(feedStories, function(s,i){
                    s.feed = feed;
                    s.Summary = stripSummary(s.Summary)

                })
                $scope.viewModel.stories = $scope.viewModel.stories.concat(feedStories)
            })

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

            })
            $scope.viewModel.stories = feedStories;
        }


        $scope.openStory = function (index){
            var s = $scope.viewModel.stories[index];
            $state.go('story',{story:s,opmlFeed: $scope.viewModel.opmlFeed})
        }

        $scope.goToOpmlList = function(){
            $state.go('tab.contents')
        }

    });