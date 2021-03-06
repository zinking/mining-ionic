angular.module('mining.content')
    .factory('ContentDataService', function($http, $q, $interval, SessionService, BASE_SERVER_URL, UserDataModel) {

        var LIST_FEEDS_PATH             = BASE_SERVER_URL + '/user/list-feeds';
        var LIST_STAR_FEEDS_PATH        = BASE_SERVER_URL + '/user/list-starfeeds';
        var GET_MORE_FEEDS_PATH         = BASE_SERVER_URL + '/user/get-feedsstories';
        var GET_MORE_STARFEEDS_PATH     = BASE_SERVER_URL + '/user/get-starstories';
        var LOAD_STORY_CONTENT_PATH     = BASE_SERVER_URL + '/user/get-contents';
        var ADD_FEED_SOURCE_PATH        = BASE_SERVER_URL + '/user/add-subscription';
        var ARRANGE_FEED_SOURCE_PATH    = BASE_SERVER_URL + '/user/arrange-feedsource';
        var GET_ADD_SUGGEST_PATH        = BASE_SERVER_URL + '/user/get-addsuggestion';
        var REMOVE_FEED_SOURCE_PATH     = BASE_SERVER_URL + '/user/remove-subscription';
        var PREVIEW_FEED_SOURCE_PATH    = BASE_SERVER_URL + '/user/preview-subscription';
        var MARK_STORY_READ_PATH        = BASE_SERVER_URL + '/user/mark-read';
        var MARK_STORY_STAR_PATH        = BASE_SERVER_URL + '/user/mark-star';
        var MARK_FEED_READ_PATH         = BASE_SERVER_URL + '/user/mark-feedread';
        var MARK_FEEDS_READ_PATH        = BASE_SERVER_URL + '/user/mark-feedsread';
        var APPEND_STORY_STATS_PATH     = BASE_SERVER_URL + '/user/append-stats';
        var LOAD_LM_READ_STATS_PATH     = BASE_SERVER_URL + '/user/load-lastmonth-readstats';
        var LOAD_LM_FEED_STATS_PATH     = BASE_SERVER_URL + '/user/load-lastmonth-feedstats';


        //push the stats collected to server every 1 minute
        var statsPusher = $interval(function(){
            if (globalUserData.UserActStats.length > 0) {
                var data = globalUserData.UserActStats;
                var req = SessionService.getUserPostRequest(APPEND_STORY_STATS_PATH, data);
                $http(req).
                    success(function (d) {
                        //maybe check the return val is 1
                        globalUserData.clearStats();
                    }).
                    error(function () {
                        console.log("error sending stats to server")
                    });
            }

        }, 1000*60*1);

        function makeHttpRequest(request) {
            var deferred = $q.defer();
            $http(request).
                success(function (d) {
                    deferred.resolve(d);
                }).
                error(function () {
                    deferred.reject();
                });
            return deferred.promise;
        }


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
            listStarFeed: function(){
                var req = SessionService.getUserGetRequest(LIST_STAR_FEEDS_PATH);
                var deferred = $q.defer();
                $http(req).
                    success(function (d) {
                        //globalUserData.cleanFeedStructure();
                        globalUserData.setStarFeedStructure(d);
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
                var requestData = _.map(storyIds, function(sl){
                    if (sl<0) sl = -sl; //I know this is the virtual stories
                    return {'StoryId':sl}
                });
                var req = SessionService.getUserPostRequest(LOAD_STORY_CONTENT_PATH,requestData);
                var deferred = $q.defer();

                $http(req).
                    success(function (d) {
                        _.each(storyIds, function (storyId, i) {
                            var sc = { 'storyId':storyId, 'content':d[i].Content, 'summary':d[i].Summary };
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
                return makeHttpRequest(req);
            },
            getAddSuggestion: function(query) {
                var requestData = {'query':query};
                var req = SessionService.getUserPostRequest(GET_ADD_SUGGEST_PATH,requestData);
                return makeHttpRequest(req);
            },
            addFeedSource: function(feedUrl,folder) {
                var requestData = {'url':feedUrl,'folder':folder};
                var req = SessionService.getUserPostRequest(ADD_FEED_SOURCE_PATH,requestData);
                return makeHttpRequest(req);
            },
            arrangeFeedSource: function(changes) {
                var requestData = {"changes":changes};
                var req = SessionService.getUserPostRequest(ARRANGE_FEED_SOURCE_PATH,requestData);
                return makeHttpRequest(req);
            },
            loadMoreStories: function(feedUrls, pageNo) {
                var requestData = {'FS':feedUrls, 'C':pageNo};
                var req = SessionService.getUserPostRequest(GET_MORE_FEEDS_PATH,requestData);
                return makeHttpRequest(req);
            },

            loadMoreStarStories: function(feedUrls, pageNo) {
                var requestData = {'FS':feedUrls, 'C':pageNo};
                var req = SessionService.getUserPostRequest(GET_MORE_STARFEEDS_PATH,requestData);
                return makeHttpRequest(req);
            },
            markStoryRead: function(feedId, storyId) {
                if (storyId<0) storyId = -storyId; //I know this is the virtual stories
                var requestData = [{'FeedId':feedId, 'StoryId':storyId, 'Read':1}];
                var req = SessionService.getUserPostRequest(MARK_STORY_READ_PATH,requestData);
                return makeHttpRequest(req);
            },
            markStoryStar: function(feedId, storyId) {
                if (storyId<0) storyId = -storyId; //I know this is the virtual stories
                var requestData = {'FeedId':feedId, 'StoryId':storyId, 'Star':1};
                var req = SessionService.getUserPostRequest(MARK_STORY_STAR_PATH,requestData);
                return makeHttpRequest(req);
            },
            markFeedRead: function(feedId) {
                var requestData = {'FeedId':feedId};
                var req = SessionService.getUserPostRequest(MARK_FEED_READ_PATH,requestData);
                return makeHttpRequest(req);
            },
            markFeedsRead: function(feedIds) {
                var req = SessionService.getUserPostRequest(MARK_FEEDS_READ_PATH,feedIds);
                return makeHttpRequest(req);
            },
            removeFeedSource: function(feedUrl) {
                var requestData = {'url':feedUrl};
                var req = SessionService.getUserPostRequest(REMOVE_FEED_SOURCE_PATH,requestData);
                return makeHttpRequest(req);
            },
            loadLastMonthFeedStats: function() {
                var req = SessionService.getUserPostRequest(LOAD_LM_FEED_STATS_PATH,{});
                return makeHttpRequest(req);
            },
            loadLastMonthReadStats: function() {
                var req = SessionService.getUserPostRequest(LOAD_LM_READ_STATS_PATH,{});
                return makeHttpRequest(req);
            }

        };
    });