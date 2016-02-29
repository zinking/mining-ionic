angular.module('mining', [
    'angularMoment',
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
                views: {
                    'tab-contents': {
                        templateUrl: 'js/content/templates/OpmlNestedListView.html',
                        controller: 'OpmlListCtrl'
                    }
                }
            })
            .state('tab.stars', {
                url: '/stars',
                views: {
                    'tab-stars': {
                        templateUrl: 'js/content/templates/OpmlStarNestedListView.html',
                        controller: 'OpmlStarListCtrl'
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
            .state('register', {
                url: "/register",
                controller: 'RegisterCtrl',
                templateUrl: "js/account/templates/RegisterView.html"
            })
            .state('feed', {
                url: '/feed',
                cache: false,
                templateUrl: 'js/content/templates/FeedView.html',
                params: { opmlFeed:null },
                controller: 'FeedCtrl'
            })
            .state('addfeed', {
                url: '/addfeed',
                cache: false,
                templateUrl: 'js/content/templates/AddNestedListView.html',
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
                templateUrl: 'js/content/templates/StoryView.html',
                params: { story: null,opmlFeed: null },
                controller: 'StoryCtrl'
            })
            ;
        $urlRouterProvider.otherwise('/tab/contents');
    })

    .controller('TabCtrl', function ($scope) {

    });