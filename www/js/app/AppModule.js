angular.module('mining', [
    'angularMoment',
    'ion-autocomplete',
    'ui.select2',
    'nvd3',
    "ng.deviceDetector",
    'mining.session',
    'mining.content',
    'mining.account'
]).run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            //if (window.StatusBar) {
            //    StatusBar.styleLightContent();
            //}
        });
    })
    .config(function ($ionicConfigProvider) {
        $ionicConfigProvider.views.maxCache(3);
        $ionicConfigProvider.tabs.position("bottom");
    })
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
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

            .state('tab', {
                url: "/tab",
                abstract: true,
                controller: 'TabCtrl',
                templateUrl: "js/app/directives/templates/TabView.html"
            })
            .state('tab.read', {
                url: '/read',
                // this page should be cached, as it is the heaviest
                // TODO: the side effect of this is, the counters are not up-to-date
                // I'm keeping this issue at the moment
                views: {
                    'tab-read': {
                        templateUrl: 'js/content/templates/ReadTabView.html',
                        controller: 'ReadTabCtrl'
                    }
                }
            })
            .state('tab.follow', {
                url: '/follow',
                //cache: false,
                views: {
                    'tab-follow': {
                        templateUrl: 'js/content/templates/FollowTabView.html',
                        controller: 'FollowTabCtrl'
                    }
                }
            })
            .state('tab.manage', {
                url: '/manage',
                cache:false,
                views: {
                    'tab-manage': {
                        templateUrl: 'js/content/templates/ManageTabView.html',
                        controller: 'ManageTabCtrl'
                    }
                }
            })
            .state('full', {
                url: '/full',
                templateUrl: 'js/content/templates/FullReadView.html',
                params: { opml:null, mode:'expand', device:'Tablet' },
                controller: 'FullReadCtrl'
            })
            .state('full.readFeed', {
                cache:false,
                views: {
                    'full': {
                        templateUrl: 'js/content/templates/FullReadFeedView.html',
                        params: { opml:null, mode:'expand', device:'Tablet' },
                        controller: 'ReadFeedCtrl'
                    }
                }
            })

            .state('readFeed', {
                url: '/feed/read',
                cache: false,
                templateUrl: 'js/content/templates/ReadFeedView.html',
                params: { opml:null, mode:'item', device:'mobile' },
                controller: 'ReadFeedCtrl'
            })
            .state('addFeed', {
                url: '/feed/add',
                cache: false,
                templateUrl: 'js/content/templates/ReadAddFeedView.html',
                controller: 'ReadAddFeedCtrl'
            })
            .state('importFeed', {
                url: '/feed/import',
                cache: false,
                templateUrl: 'js/content/templates/ReadImportFeedView.html',
                controller: 'ReadImportFeedCtrl'
            })
            .state('readStory', {
                url: '/feed/story',
                cache: false,
                templateUrl: 'js/content/templates/ReadStoryView.html',
                params: { story: null, mode:'full', device:'mobile' },
                controller: 'ReadStoryCtrl'
            })

            .state('manageAdjust', {
                url: '/manage/adjust',
                cache: false,
                templateUrl: 'js/content/templates/ManageFeedAdjustView.html',
                controller: 'ManageFeedAdjustCtrl'
            })
            .state('manageReadTrend', {
                url: '/manage/trend/read',
                cache: false,
                templateUrl: 'js/content/templates/ManageReadTrendView.html',
                controller: 'ManageReadTrendCtrl'
            })
            .state('manageFeedTrend', {
                url: '/manage/trend/feed',
                cache: false,
                templateUrl: 'js/content/templates/ManageFeedTrendView.html',
                controller: 'ManageFeedTrendCtrl'
            })
            ;
        $urlRouterProvider.otherwise('/tab/read');
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

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

_.sum = function(arr){
    return _.reduce(arr, function(m, n){ return m + n; }, 0);
};



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