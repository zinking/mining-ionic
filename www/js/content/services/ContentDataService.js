angular.module('mining.content')
    .factory('ContentDataService', function($http, $q, SessionService, BASE_SERVER_URL, UserDataModel) {

        var LIST_FEEDS_PATH             = BASE_SERVER_URL + '/user/list-feeds';
        var GET_MORE_FEEDS_PATH         = BASE_SERVER_URL + '/user/get-feedsstories';
        var LOAD_STORY_CONTENT_PATH     = BASE_SERVER_URL + '/user/get-contents';
        var ADD_FEED_SOURCE_PATH        = BASE_SERVER_URL + '/user/add-subscription';
        var REMOVE_FEED_SOURCE_PATH     = BASE_SERVER_URL + '/user/remove-subscription';
        var PREVIEW_FEED_SOURCE_PATH    = BASE_SERVER_URL + '/user/preview-subscription';

        return {
            listFeed: function(){
                var req = SessionService.getUserGetRequest(LIST_FEEDS_PATH);
                var deferred = $q.defer();
                $http(req).
                    success(function (d) {
                        globalUserData.cleanFeedStructure();
                        globalUserData.setFeedStructure(d);
                        deferred.resolve();
                    }).
                    error(function () {
                        deferred.reject();
                    });
                return deferred.promise;
            },
            saveLocalUserData: function(){
                var gUserData = globalUserData.toJSONObject();
                window.localStorage['userData.global'] = JSON.stringify(gUserData);
            },
            loadLocalUserData: function () {
                var globalData = window.localStorage['userData.global'];
                var gUserData = JSON.parse(globalData);
                globalUserData = UserDataModel.fromJSONObject(gUserData);
            },
            loadStoryContentFromServer: function(storyIds) {
                var requestData = _.map(storyIds, function(sl){ return {'StoryId':sl} });
                var req = SessionService.getUserPostRequest(LOAD_STORY_CONTENT_PATH,requestData);
                var deferred = $q.defer();

                $http(req).
                    success(function (d) {
                        _.each(storyIds, function (storyId, i) {
                            var sc = { 'storyId':storyId, 'content':d[i] };
                            globalUserData.addStoryContent(sc);
                        });
                        deferred.resolve();
                    }).
                    error(function () {
                        deferred.reject();
                    });
                return deferred.promise;
            },
            previewFeedSource: function(feedUrl) {
                var requestData = {'url':feedUrl};
                var req = SessionService.getUserPostRequest(PREVIEW_FEED_SOURCE_PATH,requestData);
                var deferred = $q.defer();

                $http(req).
                    success(function (d) {
                        deferred.resolve(d);
                    }).
                    error(function () {
                        deferred.reject();
                    });
                return deferred.promise;
            },
            addFeedSource: function(feedUrl) {
                var requestData = {'url':feedUrl};
                var req = SessionService.getUserPostRequest(ADD_FEED_SOURCE_PATH,requestData);
                var deferred = $q.defer();

                $http(req).
                    success(function (d) {
                        deferred.resolve(d);
                    }).
                    error(function () {
                        deferred.reject();
                    });
                return deferred.promise;
            },
            loadMoreStories: function(feedUrls, pageNo) {
                var requestData = {'FS':feedUrls, 'C':pageNo};
                var req = SessionService.getUserPostRequest(GET_MORE_FEEDS_PATH,requestData);
                var deferred = $q.defer();
                $http(req).
                    success(function (d) {
                        deferred.resolve(d);
                    }).
                    error(function () {
                        deferred.reject();
                    });
                return deferred.promise;
            },
            removeFeedSource: function(feedUrl) {
                var requestData = {'url':feedUrl};
                var req = SessionService.getUserPostRequest(REMOVE_FEED_SOURCE_PATH,requestData);
                var deferred = $q.defer();

                $http(req).
                    success(function (d) {
                        deferred.resolve(d);
                    }).
                    error(function () {
                        deferred.reject();
                    });
                return deferred.promise;
            }

        };
    });