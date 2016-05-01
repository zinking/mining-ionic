angular.module('mining.content')
    .directive('feed', ['$compile', function($compile) {
        return {
            restrict: 'E',
            templateUrl: 'js/content/directives/templates/Feed.html',
            replace: true,
            transclude: true,
            scope: {
                feed: '=feed',
                onFeedClicked: '&'
            },
            controller: function($scope, $element) {
            }
        }
    }]);