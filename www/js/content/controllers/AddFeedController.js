angular.module('mining.content')
    .controller('AddFeedCtrl', function($scope, $ionicLoading,$state,$ionicPopup,
                                         AccountDataService,
                                         ContentDataService,
                                         SessionService) {
        $scope.viewModel = {
            feedUrl: "",
            hasFeedStory : false,
            feedStories : []
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

        $scope.addFeedSource = function(){
            ContentDataService.addFeedSource($scope.viewModel.feedUrl).then(
                function(data){
                    if (data.error!=null){
                        $ionicPopup.alert({
                            title: 'Subscribe Feed issue',
                            subtitle:data.error
                        });
                    }
                    else{
                        $ionicPopup.alert({
                            title: data.data
                        });

                        //load latest content
                        ContentDataService.listFeed()
                        $state.go('tab.contents')
                    }
                },
                function(){
                    $ionicPopup.alert({
                        title: 'Subscribe Faild, retry later'
                    });
                }
            )
        }

        $scope.previewFeedSource = function (){
            ContentDataService.previewFeedSource($scope.viewModel.feedUrl).then(
                function(data){
                    if (data.error!=null){
                        $ionicPopup.alert({
                            title: 'Preview Feed issue',
                            subtitle:data.error
                        });
                    }
                    else{
                        if (data.Stories.length==0){
                            $ionicPopup.alert({
                                title: 'No stories for this feed'
                            });
                        }
                        else{
                            $scope.viewModel.feedStories = data.Stories;
                            $scope.viewModel.hasFeedStory = true;
                        }
                    }
                },
                function(){
                    $ionicPopup.alert({
                        title: 'Loading Prview Faild, retry later'
                    });
                }
            )
        }

    });