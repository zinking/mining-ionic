angular.module('mining.content')
.controller(
    'ManageFeedAdjustCtrl', function(
        $scope, $ionicLoading,$state,$ionicSideMenuDelegate,$ionicPopup,
        AccountDataService, ContentDataService, SessionService
    ){
        SessionService.refreshIfExpired();
        $scope.router = SessionService.routeUtil;
        
        $scope.viewModel = {
            currentOpmlFeeds:[],
            isBusy: false,
            folderOptions:[]
        };

        //clone the structure
        $scope.viewModel.opmlFeeds = JSON.parse(JSON.stringify(globalUserData.Opml));

        $scope.isOpmlModified = function(opml) {
            return !!(opml.Title != opml.OTitle ||
            opml.Folder != opml.OFolder ||
            opml.Delete);
        };

        $scope.markFeedDelete = function(opml) {
            opml.Delete = !opml.Delete;
        };

        //setup the data structure for arrange
        _.forEach($scope.viewModel.opmlFeeds, function(opml){
            if (opml.isFolder()) {
                _.forEach(opml.Outline, function(feed){
                    feed.OTitle = feed.Title;
                    feed.OFolder = opml.Title;
                    feed.Folder = opml.Title;
                    feed.Delete = false;
                    feed.Deleted = false;
                });
            } else {
                opml.OTitle = opml.Title;
                opml.OFolder = "";
                opml.Folder = "";
                opml.Delete = false;
                opml.Deleted = false;
            }
        });

        $scope.viewModel.totalOpmlsCount = $scope.viewModel.opmlFeeds.length;
        $scope.viewModel.currentOpmlsCount = 0;

        $scope.hasMoreOpmls = function() {
            return $scope.viewModel.currentOpmlsCount < $scope.viewModel.totalOpmlsCount;
        };

        $scope.loadMoreOpmls = function() {
            $scope.viewModel.currentOpmlsCount += 2;

            if ($scope.viewModel.currentOpmlsCount>$scope.viewModel.totalOpmlsCount) {
                $scope.viewModel.currentOpmlsCount = $scope.viewModel.totalOpmlsCount;
            }
            $scope.viewModel.currentOpmlFeeds = $scope.viewModel.opmlFeeds.slice(0,$scope.viewModel.currentOpmlsCount);

            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.$broadcast('scroll.resize');

        };
        $scope.loadMoreOpmls();


        $scope.getFolderOptions = function() {
            var folderOpmls = globalUserData.getFolderOpmls();
            function opmlToOption(opml) {
                return {id: opml.Title, text: opml.Title};
            }
            return _.map(folderOpmls, opmlToOption);
        };

        $scope.viewModel.folderOptions = $scope.getFolderOptions();

        $scope.pickOption = {
            width: 'resolve'
        };

        //$('.folderPicker').select2({
        //    data: currentFolders,
        //    width: 'resolve',
        //    createSearchChoice: function(term, data) {
        //        var filteredOptions = _.filter(data,function(option){
        //            return option.text.indexOf(term) > -1;
        //        });
        //        if (filteredOptions.length==0) {
        //            return { id:term, text:term };
        //        } else {
        //            return filteredOptions;
        //        }
        //    }
        //});


        $scope.applyAllChanges = function() {
            var allOpmls = $scope.viewModel.opmlFeeds;
            $scope.viewModel.changes = [];
            var changedFeeds = [];
            _.forEach(allOpmls, function(opml){
                if (opml.isFolder()) {
                    _.forEach(opml.Outline, function(feed){
                        if ($scope.isOpmlModified(feed)) {
                            var change = {
                                'XmlUrl': feed.XmlUrl,
                                'Folder': feed.Folder,
                                'Title' : feed.Title,
                                'Delete': feed.Delete
                            };
                            changedFeeds.push(change);
                            $scope.viewModel.changes.push(feed);
                        }
                    });
                } else {
                    if ($scope.isOpmlModified(opml)) {
                        var change = {
                            'XmlUrl': opml.XmlUrl,
                            'Folder': opml.Folder,
                            'Title': opml.Title,
                            'Delete': opml.Delete
                        };
                        changedFeeds.push(change);
                        $scope.viewModel.changes.push(opml);
                    }
                }
            });

            if (changedFeeds.length == 0 ) {
                return;
            }

            ContentDataService.arrangeFeedSource(changedFeeds).then(
                function(data){
                    $scope.viewModel.isBusy = false;
                    if (data.error!=null){
                        $ionicPopup.alert({
                            title: 'Arrange Feed issue',
                            subtitle:data.error
                        });
                    }
                    else{
                        $ionicPopup.alert({
                            title: 'Arrange Feed Success',
                            subtitle:'Refresh Page to view the result'
                        });

                        //reset the changes
                        _.forEach($scope.viewModel.changes, function(opml){
                            opml.OTitle = opml.Title;
                            opml.OFolder = opml.Folder;
                            opml.Deleted = true;

                        });
                        $scope.viewModel.changes = [];
                    }
                },
                function(){
                    $scope.viewModel.isBusy = false;
                    $ionicPopup.alert({
                        title: 'Arrange Feed Failed, retry later'
                    });
                }
            )


        }


});