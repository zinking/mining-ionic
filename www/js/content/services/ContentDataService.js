angular.module('mining.content')
    .factory('ContentDataService', function($http,
                                            $q,
                                            SessionService,
    										BASE_SERVER_URL) {

        var LIST_FEEDS_PATH  = BASE_SERVER_URL + '/user/list-feeds'
        var LOAD_STORY_CONTENT_PATH  = BASE_SERVER_URL + '/user/get-contents'

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
                }

                $http(req).
                    success(function (d) {
                        var me = miningUserData;
                        me.OpmlsList = d.Opml;
                        me.StoriesMap = d.Stories;
                        me.FeedsMap = {};
                        for(var feed in d.Feeds){ //put feeds into map
                            me.FeedsMap[feed.Url] =feed;
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
            loadStoryContentFromServer: function(storyLinks) {
                var apiToken = miningUserData.apiKey;
                var deferred = $q.defer();
                var promise = deferred.promise;

                var requestData = _.map(storyLinks, function(sl){ return {'Story':sl} });

                var req = {
                    method: 'POST',
                    url: LOAD_STORY_CONTENT_PATH,
                    headers: {'mining':apiToken},
                    data:requestData,
                    timeout: 60000
                }

                $http(req).
                    success(function (d) {
                        deferred.resolve();
                        _.each(storyLinks, function(e,i,l){
                            miningUserData.storylink2ContentMap[e]=d[i];
                        })
                    }).
                    error(function () {
                        deferred.reject();
                    });
                return promise;
            }

        };
    });