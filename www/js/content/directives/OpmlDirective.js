angular.module('mining.content')
    .directive('opml', ['$compile', function($compile) {
        return {
            restrict: 'E',
            templateUrl: 'js/content/directives/templates/Opml.html',
            replace: true,
            transclude: true,
            scope: {
                opml: '=opml',
                onOpmlClicked: '&',
                onOpmlFeedClicked: '&'
            },
            controller: function($scope, $element) {
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