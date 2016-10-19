angular.module('mining.content')
    .directive('opml', ['$compile', function() {
        return {
            restrict: 'E',
            templateUrl: 'js/content/directives/templates/OpmlAdjust.html',
            replace: true,
            transclude: true,
            scope: {
                opml: '=opml',
                onOpmlClicked: '&',
                onOpmlFeedClicked: '&'
            },
            controller: function($scope) {
                $scope.viewModel = {
                    isBusy : false
                };

                $scope.openFolder = function (opml) {
                    opml.isOpen = !opml.isOpen;
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $scope.$broadcast('scroll.resize');
                };

            }
        }
    }]);