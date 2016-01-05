angular.module('mining.content')
    .controller('FeedCtrl', function($scope, $ionicLoading,$state,$stateParams,$ionicPopover,$ionicPopup,
                                     ContentDataService,
                                     AccountDataService, SessionService) {
        $scope.viewModel = {
            stories : [],
            opmlFeed :{},
            isBusy:false,
            feedIndex : 0
        };

        if ($stateParams.opmlFeed == null ){
            $state.go('tab.contents')
        }
        var opmlFeed = $stateParams.opmlFeed;
        $scope.viewModel.opmlFeed = opmlFeed;

        $ionicPopover.fromTemplateUrl('feed-menu-popover.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });


        $scope.openPopover = function($event) {
            $scope.popover.show($event);
        };
        $scope.closePopover = function() {
            $scope.popover.hide();
        };
        $scope.$on('$destroy', function() {
            $scope.popover.remove();
        });

        $scope.removeFeedSource = function(){
            var confirmPopup = $ionicPopup.confirm({
                title: 'UnSubscribe',
                template: 'Are you sure you want to UnSubscribe?'
            });

            confirmPopup.then(function(res) {
                if(res) {
                    $scope.doRemoveFeedSource();
                    console.log('You are sure to remove');
                } else {
                    console.log('You are not sure');
                }
            });
        };

        $scope.doRemoveFeedSource = function(){
            var feedUrl = $scope.viewModel.opmlFeed.XmlUrl;
            $scope.viewModel.isBusy = true;
            ContentDataService.removeFeedSource(feedUrl).then(
                function(data){
                    $scope.viewModel.isBusy = false;
                    if (data.error!=null){
                        $ionicPopup.alert({
                            title: 'UnSubscribe Feed issue',
                            subtitle:data.error
                        });
                    }
                    else{
                        $ionicPopup.alert({
                            title: data.data
                        });
                        $state.go('tab.contents')
                    }
                },
                function(){
                    $scope.viewModel.isBusy = false;
                    $ionicPopup.alert({
                        title: 'UnSubscribe Faild, retry later'
                    });
                }
            )
        };


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



        if( "Outline" in opmlFeed && opmlFeed["Outline"].length>0 ){
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
            var feedStories = miningUserData.StoriesMap[feedXmlUrl];
            fitFeedTitle(opmlFeed,30);
            _.each(feedStories, function(s,i){
                s.feed = opmlFeed;
                s.Summary = stripSummary(s.Summary)

            });
            $scope.viewModel.stories = feedStories;
        }


        $scope.openStory = function (index){
            var s = $scope.viewModel.stories[index];
            $state.go('story',{story:s,opmlFeed: $scope.viewModel.opmlFeed})
        };

        $scope.goToOpmlList = function(){
            $state.go('tab.contents')
        };

    });