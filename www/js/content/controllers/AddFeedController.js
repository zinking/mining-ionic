angular.module('mining.content')
    .controller('AddFeedCtrl', function($scope, $ionicLoading,$state,$ionicPopup,$ionicPopover,
                                         AccountDataService,
                                         ContentDataService,
                                         SessionService) {
        $scope.viewModel = {
            feedUrl: "",
            hasFeedStory : false,
            isBusy: false,
            feedStories : []
        };

        //verify user credential exists
        var userData = AccountDataService.getUserData();
        if( userData == "" ){
            $state.go('login');
        }

        $scope.goHome = function(){
            $state.go('tab.contents')
        };

        $scope.addFeedSource = function(){
            $scope.viewModel.isBusy = true;
            ContentDataService.addFeedSource($scope.viewModel.feedUrl).then(
                function(data){
                    $scope.viewModel.isBusy = false;
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
                        ContentDataService.listFeed();
                        $state.go('tab.contents')
                    }
                },
                function(){
                    $scope.viewModel.isBusy = false;
                    $ionicPopup.alert({
                        title: 'Subscribe Faild, retry later'
                    });
                }
            )
        };

        function isValidUrl(s) {
            var regexp1 = /^HTTP|HTTP|http(s)?:\/\/(www\.)?[A-Za-z0-9]+([\-\.]{1}[A-Za-z0-9]+)*\.[A-Za-z]{2,40}(:[0-9]{1,40})?(\/.*)?$/;
            var regexp2 = /^(www\.)?[A-Za-z0-9]+([\-\.]{1}[A-Za-z0-9]+)*\.[A-Za-z]{2,40}(:[0-9]{1,40})?(\/.*)?$/;
            return regexp1.test(s) || regexp2.test(s);
        }

        $scope.previewFeedSource = function ($event){
            var feedUrl = $scope.viewModel.feedUrl;
            if (isValidUrl(feedUrl)){
                if (feedUrl.substr(0,4)!='http'){
                    feedUrl='http://'+feedUrl;
                    $scope.viewModel.feedUrl = feedUrl;
                }
                $scope.viewModel.isBusy = true;
                ContentDataService.previewFeedSource(feedUrl).then(
                    function(data){
                        $scope.viewModel.isBusy = false;
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
                        $scope.viewModel.isBusy = false;
                        $ionicPopup.alert({
                            title: 'Loading Prview Faild, retry later'
                        });
                    }
                )
            }
            else{
                $ionicPopup.alert({
                    title: 'Invalid Url'
                });
            }

        }

    });