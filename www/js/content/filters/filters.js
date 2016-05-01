angular.module('mining.content')
    .filter('filterRead', function(){
        return function (stories, filterRead) {
            var filtered = [];
            for (var i = 0; i < stories.length; i++) {
                var story = stories[i];
                if (!(story.isRead&&filterRead)){
                    filtered.push(story);
                }
            }
            return filtered;
        };
    })
    .filter('unsafe', function($sce) {
        return $sce.trustAsHtml;
    });