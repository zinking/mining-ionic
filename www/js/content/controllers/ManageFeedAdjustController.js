angular.module('mining.content')
.controller(
    'ManageFeedAdjustCtrl', function(
        $scope, $ionicLoading,$state,$ionicSideMenuDelegate,$ionicPopup,
        AccountDataService, ContentDataService, SessionService
    ){
        $scope.router = SessionService.routeUtil;

        //SessionService.refreshIfExpired();
        if (typeof globalUserData === "undefined") {
            $scope.router.goReadTab();
            return;
        }

        
        $scope.viewModel = {
            opmls:[],
            isBusy: false,
            folderOptions:[]
        };

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

        //clone the structur
        // $scope.viewModel.opmls = JSON.parse(JSON.stringify(globalUserData.Opml));
        $scope.viewModel.opmls = globalUserData.Opml;

        $scope.isOpmlModified = function(opml) {
            return !!(
                opml.Title != opml.OTitle ||
                opml.Folder != opml.OFolder ||
                opml.Delete
            );
        };

        $scope.markFeedDelete = function(opml) {
            opml.Delete = !opml.Delete;
        };

        //setup the data structure for arrange
        _.forEach($scope.viewModel.opmls, function(opml){
            if (opml.isFolder()) {
                _.forEach(opml.Outline, function(childOpml){
                    childOpml.OTitle = childOpml.Title;
                    childOpml.OFolder = opml.Title;
                    childOpml.Folder = opml.Title;
                    childOpml.Delete = false;
                    childOpml.Deleted = false;
                });
            } else {
                opml.OTitle = opml.Title;
                opml.OFolder = "";
                opml.Folder = "";
                opml.Delete = false;
                opml.Deleted = false;
            }
        });

        $scope.viewModel.totalOpmlsCount = $scope.viewModel.opmls.length;
        $scope.viewModel.currentOpmlsCount = 0;

        $scope.hasMoreOpmls = function() {
            return $scope.viewModel.currentOpmlsCount < $scope.viewModel.totalOpmlsCount;
        };

        $scope.loadMoreOpmls = function() {
            $scope.viewModel.currentOpmlsCount += 2;

            if ($scope.viewModel.currentOpmlsCount>$scope.viewModel.totalOpmlsCount) {
                $scope.viewModel.currentOpmlsCount = $scope.viewModel.totalOpmlsCount;
            }
            $scope.viewModel.currentOpmlFeeds = $scope.viewModel.opmls.slice(0,$scope.viewModel.currentOpmlsCount);

            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.$broadcast('scroll.resize');

        };
        $scope.loadMoreOpmls();




        //$('.folderPicker').select2({
        //    data: $scope.viewModel.folderOptions,
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
            var allOpmls = $scope.viewModel.opmls;
            $scope.viewModel.changes = [];
            var changedFeeds = [];
            _.forEach(allOpmls, function(opml){

                _.forEach(opml.getOutlines(), function(feed){
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

            });

            if (changedFeeds.length == 0 ) {
                return;
            }

            $scope.viewModel.isBusy = true;
            SessionService.apiCall(
                'Arrange Feed',
                ContentDataService.arrangeFeedSource(changedFeeds),
                function() {
                    $scope.viewModel.isBusy = false;
                    //reset the changes
                    _.forEach($scope.viewModel.changes, function(opml){
                        opml.OTitle  = opml.Title;
                        opml.OFolder = opml.Folder;
                        opml.Deleted = true;

                    });
                    $scope.viewModel.changes = [];

                },
                function() {
                    $scope.viewModel.isBusy = false;
                }
            );
        }
});