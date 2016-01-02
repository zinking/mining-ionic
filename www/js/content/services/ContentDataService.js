angular.module('mining.content')
    .factory('ContentDataService', function($http,
                                            $q,
                                            SessionService,
    										BASE_SERVER_URL) {

        var LIST_FEEDS_PATH  = BASE_SERVER_URL + '/user/list-feeds';
        var LOAD_STORY_CONTENT_PATH  = BASE_SERVER_URL + '/user/get-contents';
        var ADD_FEED_SOURCE_PATH  = BASE_SERVER_URL + '/user/add-subscription';
        var REMOVE_FEED_SOURCE_PATH  = BASE_SERVER_URL + '/user/remove-subscription';
        var PREVIEW_FEED_SOURCE_PATH  = BASE_SERVER_URL + '/user/preview-subscription';

        return {
            listFeed: function(){
                var apiToken = miningUserData.apiKey;
                var deferred = $q.defer();
                var promise = deferred.promise;

                var req = {
                    method: 'GET',
                    url: LIST_FEEDS_PATH,
                    headers: {'mining':apiToken},
                    timeout: 60000
                };

                $http(req).
                    success(function (d) {
                        var me = miningUserData;
                        me.OpmlsList = d.Opml;
                        me.StoriesMap = {};
                        me.FeedsMap = {};
                        me.FeedId2Url={};

                        var i=0, len=0;
                        for(i=0, len=d.FeedIds.length; i < len; i++){
                            var idItem = d.FeedIds[i];
                            //build the feedId to XmlUrl map
                            me.FeedId2Url[idItem.Id] = idItem.XmlUrl;
                        }
                        for(i=0, len=d.Stories.length; i < len; i++){
                            //build the XmlUrl2Stories map
                            var story = d.Stories[i];
                            var feedId = story.FeedId;
                            var feedUrl = me.FeedId2Url[feedId];
                            if (!(feedUrl in me.StoriesMap)){
                                me.StoriesMap[feedUrl] = [];
                            }
                            me.StoriesMap[feedUrl].push(story)
                        }
                        for(i=0, len=d.Feeds.length; i < len; i++){
                            var feed = d.Feeds[i];
                            me.FeedsMap[feed.XmlUrl] =feed;
                        }
                        deferred.resolve();
                    }).
                    error(function () {
                        deferred.reject();
                    });
                return promise;
            },
            cacheListedFeed: function(){
                window.localStorage['userData.OpmlList'] = JSON.stringify(miningUserData.OpmlsList);
                window.localStorage['userData.StoriesMap'] = JSON.stringify(miningUserData.StoriesMap);
            },
            loadCachedListFeed: function () {
                var OpmlList = window.localStorage['userData.OpmlList'];
                miningUserData.OpmlsList = JSON.parse(OpmlList);
                var StoriesMap = window.localStorage['userData.StoriesMap'];
                miningUserData.StoriesMap = JSON.parse(StoriesMap);
            },
            loadStoryContentFromCache: function(storyLink) {
                if( storyLink in miningUserData.storylink2ContentMap){
                    return miningUserData.storylink2ContentMap[storyLink];
                }
                return null;
            },
            loadStoryContentFromServer: function(storyIds) {
                var apiToken = miningUserData.apiKey;
                var deferred = $q.defer();
                var promise = deferred.promise;

                var requestData = _.map(storyIds, function(sl){ return {'StoryId':sl} });

                var req = {
                    method: 'POST',
                    url: LOAD_STORY_CONTENT_PATH,
                    headers: {'mining':apiToken},
                    data:requestData,
                    timeout: 60000
                };

                $http(req).
                    success(function (d) {
                        deferred.resolve();
                        _.each(storyIds, function(sid,i,l){
                            miningUserData.storylink2ContentMap[sid]=d[i];
                        })
                    }).
                    error(function () {
                        deferred.reject();
                    });
                return promise;
            },
            previewFeedSource: function(feedUrl) {
                var apiToken = miningUserData.apiKey;
                var deferred = $q.defer();
                var promise = deferred.promise;
                var requestData = {'url':feedUrl}
                var req = {
                    method: 'POST',
                    url: PREVIEW_FEED_SOURCE_PATH,
                    headers: {'mining':apiToken},
                    data:requestData,
                    timeout: 60000
                }

                $http(req).
                    success(function (d) {
                        deferred.resolve(d);
                    }).
                    error(function () {
                        deferred.reject();
                    });
                return promise;
            },
            addFeedSource: function(feedUrl) {
                var apiToken = miningUserData.apiKey;
                var deferred = $q.defer();
                var promise = deferred.promise;
                var requestData = {'url':feedUrl}
                var req = {
                    method: 'POST',
                    url: ADD_FEED_SOURCE_PATH,
                    headers: {'mining':apiToken},
                    data:requestData,
                    timeout: 60000
                }

                $http(req).
                    success(function (d) {
                        deferred.resolve(d);
                    }).
                    error(function () {
                        deferred.reject();
                    });
                return promise;
            },
            removeFeedSource: function(feedUrl) {
                var apiToken = miningUserData.apiKey;
                var deferred = $q.defer();
                var promise = deferred.promise;
                var requestData = {'url':feedUrl}
                var req = {
                    method: 'POST',
                    url: REMOVE_FEED_SOURCE_PATH,
                    headers: {'mining':apiToken},
                    data:requestData,
                    timeout: 60000
                }

                $http(req).
                    success(function (d) {
                        deferred.resolve(d);
                    }).
                    error(function () {
                        deferred.reject();
                    });
                return promise;
            }

        };


    });