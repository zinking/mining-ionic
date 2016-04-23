angular.module('mining', [
    'angularMoment',
    'ion-autocomplete',
    'ui.select2',
    'nvd3',
    'mining.session',
    'mining.content',
    'mining.account'
]).run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleLightContent();
            }
        });
    })
    .config(function ($ionicConfigProvider) {
        $ionicConfigProvider.views.maxCache(3);
        $ionicConfigProvider.tabs.position("bottom");
    })
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('tab', {
                url: "/tab",
                abstract: true,
                controller: 'TabCtrl',
                templateUrl: "js/app/directives/templates/TabView.html"
            })
            .state('tab.contents', {
                url: '/contents',
                // this page should be cached, as it is the heaviest
                // TODO: the side effect of this is, the counters are not up-to-date
                // I'm keeping this issue at the moment
                views: {
                    'tab-contents': {
                        templateUrl: 'js/content/templates/OpmlNestedListView.html',
                        controller: 'OpmlListCtrl'
                    }
                }
            })
            .state('tab.stars', {
                url: '/stars',
                //cache: false,
                views: {
                    'tab-stars': {
                        templateUrl: 'js/content/templates/OpmlStarNestedListView.html',
                        controller: 'OpmlStarListCtrl'
                    }
                }
            })
            .state('tab.manage', {
                url: '/manage',
                cache:false,
                views: {
                    'tab-manage': {
                        templateUrl: 'js/content/templates/ManageView.html',
                        controller: 'ManageCtrl'
                    }
                }
            })
            .state('side', {
                url: '/side',
                cache: false,
                templateUrl: 'js/content/templates/OpmlFeedSideView.html',
                controller: 'OpmlFeedSideCtrl'
            })
            .state('login', {
                url: "/login",
                controller: 'LoginCtrl',
                templateUrl: "js/account/templates/LoginView.html"
            })
            .state('logout', {
                url: "/logout",
                controller: 'LogoutCtrl',
                templateUrl: "js/account/templates/LogoutView.html"
            })
            .state('register', {
                url: "/register",
                controller: 'RegisterCtrl',
                templateUrl: "js/account/templates/RegisterView.html"
            })
            .state('feed', {
                url: '/feed',
                cache: false,
                templateUrl: 'js/content/templates/FeedView.html',
                params: { opmlFeed:null, source:null },
                controller: 'FeedCtrl'
            })
            .state('addfeed', {
                url: '/addfeed',
                cache: false,
                templateUrl: 'js/content/templates/AddFeedView.html',
                controller: 'AddFeedCtrl'
            })
            .state('bulkfeed', {
                url: '/bulkfeed',
                cache: false,
                templateUrl: 'js/content/templates/BulkFeedView.html',
                controller: 'BulkFeedCtrl'
            })
            .state('story', {
                url: '/story',
                cache: false,
                templateUrl: 'js/content/templates/StoryView.html',
                params: { story: null,opmlFeed: null },
                controller: 'StoryCtrl'
            })

            .state('arrangefeed', {
                url: '/arrangefeed',
                cache: false,
                templateUrl: 'js/content/templates/ManageArrangeFeedView.html',
                controller: 'ArrangeFeedCtrl'
            })
            .state('readingtrends', {
                url: '/readingtrends',
                cache: false,
                templateUrl: 'js/content/templates/ManageReadingTrendsView.html',
                controller: 'ReadingTrendsCtrl'
            })
            .state('feedtrends', {
                url: '/feedtrends',
                cache: false,
                templateUrl: 'js/content/templates/ManageFeedTrendsView.html',
                controller: 'FeedTrendsCtrl'
            })
            ;
        $urlRouterProvider.otherwise('/tab/contents');
    })

    .controller('TabCtrl', function ($scope) {

    });

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

moment.locale('en', {
    relativeTime : {
        future: "in %s",
        past:   "%s ",
        s:  "s",
        m:  "1m",
        mm: "%dm",
        h:  "1h",
        hh: "%dh",
        d:  "1d",
        dd: "%dd",
        M:  "1m",
        MM: "%dm",
        y:  "1y",
        yy: "%dy"
    }
});