angular.module('mining.content')
.controller(
    'ManageReadTrendCtrl', function(
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

        function timelyData2D3Format(timelyData) {
            function tc2xy(timeAndCount) {
                return {
                    'x': timeAndCount.t,
                    'y': timeAndCount.count
                }
            }
            var posted = _.sortBy(
                _.map(timelyData.posted, tc2xy),
                function(xy){
                    return xy.x
                }
            );
            var read = _.sortBy(
                _.map(timelyData.read, tc2xy),
                function(xy){
                    return xy.x;
                }
            );



            return [
                {"key":"Items Posted","values":posted},
                {"key":"Items Read","values":read}
            ];
        }

        $scope.drawDataToCanvas = function(data, canvasSelector) {
            nv.addGraph(function() {
                var chart = nv.models.multiBarChart()
                        .color(d3.scale.category10().range())
                        .duration(300)
                        .rotateLabels(45)      //Angle to rotate x-axis labels.
                        .showControls(false)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
                        .groupSpacing(0.24)    //Distance between each group of bars.
                    ;
                chart.reduceXTicks(false).staggerLabels(true);
                chart.xAxis
                    .axisLabel("Time")
                    .axisLabelDistance(35)
                    .showMaxMin(false)
                    //.tickFormat(d3.format('d'))
                ;
                chart.yAxis
                    .axisLabel("Items Read")
                    .axisLabelDistance(-5)
                    .tickFormat(d3.format(',.1f'))
                ;

                d3.select(canvasSelector)
                    .datum(data)
                    .call(chart);
                nv.utils.windowResize(chart.update);
                return chart;
            });
        };

        $scope.loadReadStats = function() {
            ContentDataService.loadLastMonthReadStats().then(
                function(data){
                    $scope.viewModel.isBusy = false;
                    if (data.error!=null){
                        $ionicPopup.alert({
                            title: 'Load last month stats issue',
                            subtitle:data.error
                        });
                    }
                    else{
                        $scope.viewModel.monthly = timelyData2D3Format(data.Monthly);
                        $scope.viewModel.weekly = timelyData2D3Format(data.Weekly);
                        $scope.viewModel.daily = timelyData2D3Format(data.Daily);

                        $scope.viewModel.topRead = data.TopRead;
                        $scope.viewModel.topStar = data.TopStar;

                        $scope.drawDataToCanvas($scope.viewModel.monthly,'#monthly svg');
                        $scope.drawDataToCanvas($scope.viewModel.weekly,'#weekly svg');
                        $scope.drawDataToCanvas($scope.viewModel.daily,'#daily svg');
                    }
                },
                function(){
                    $scope.viewModel.isBusy = false;
                    $ionicPopup.alert({
                        title: 'Load last month stats Faild, retry later'
                    });
                }
            )
        };

        $scope.loadReadStats();
});