angular.module('mining.content')
    .controller('ReadAddFeedCtrl',
    function($scope, $ionicLoading,$state,$ionicPopup,$ionicPopover,
             AccountDataService, ContentDataService, SessionService) {

        //SessionService.refreshIfExpired();
        if (typeof globalUserData === "undefined" ) {
            $state.go('tab.read');
            return;
        }

        $scope.router = SessionService.routeUtil;

        $scope.viewModel = {
            feedUrl: "",
            hasFeedStory : true,
            isBusy: false,
            feedStories : []
        };

        $scope.getFolderOptions = function() {
            var folderOpmls = globalUserData.getAllFolderOpmls();
            function opmlToOption(opml) {
                return {id: opml.Title, text: opml.Title};
            }
            var options = _.map(folderOpmls, opmlToOption);
            return options;
        };

        $('#folderPicker').select2({
            data: $scope.getFolderOptions(),
            width: 'resolve',
            createSearchChoice: function(term, data) {
                var filteredOptions = _.filter(data,function(option){
                    return option.text.indexOf(term) > -1;
                });
                if (filteredOptions.length==0) {
                    return { id:term, text:term };
                } else {
                    return filteredOptions;
                }
            }
        });


        $scope.getAddSuggestion =function (query, isInitializing) {
            if(isInitializing || query.length < 5) {
                return { items: [] }
            } else {
                return ContentDataService.getAddSuggestion(query)
            }
        };

        $scope.addFeedSource = function(){
            $scope.viewModel.isBusy = true;
            var selectedFolder = $('#folderPicker').val();
            SessionService.apiCall(
                'Subscribe Feed',
                ContentDataService.addFeedSource($scope.viewModel.feedUrl,selectedFolder),
                function(data) {
                    $scope.viewModel.isBusy = false;
                    $ionicPopup.alert({
                        title: 'Subscribe Feed Success',
                        subtitle: data.data
                    });
                },
                function() {
                    $scope.viewModel.isBusy = false;
                }
            );
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

                SessionService.apiCall(
                    'Preview Feed',
                    ContentDataService.previewFeedSource(feedUrl),
                    function(data) {
                        $scope.viewModel.isBusy = false;
                        if (data.Stories.length==0){
                            $ionicPopup.alert({title: 'No stories for this feed'});
                        }
                        else{
                            $scope.viewModel.feedStories = data.Stories;
                            $scope.viewModel.hasFeedStory = true;
                        }
                    },
                    function() {
                        $scope.viewModel.isBusy = false;
                    }
                );
            }
            else{
                $ionicPopup.alert({
                    title: 'Invalid Url'
                });
            }

        }

    });