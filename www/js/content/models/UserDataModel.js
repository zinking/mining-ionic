angular.module('mining.content')
    .factory('UserDataModel', function(BASE_SERVER_URL, FeedModel, StoryModel, OpmlModel) {
        var UserDataModel = function () {
            //strucutres to be persisted
            this.email = "";
            this.apiKey = "";

            this.cleanFeedStructure();
        };

        UserDataModel.prototype.cleanFeedStructure = function() {
            //strucutres to be persisted
            this.Opmls = [];
            this.Stories = [];
            this.Feeds = [];
            this.FeedIds = [];
            this.StoryContents = [];
            //structurs to be used efficiently
            this.StoriesMap = {};  //feed xml url to stories list
            this.FeedsMap = {};    //feed xml url to feed conent
            this.FeedId2Url = {};
            this.storyId2ContentMap = {};
        };

        UserDataModel.prototype.populate = function(data) {
            var model = new UserDataModel();
            model.setFeedStructure(data);
            model.setUserAuth(data);
            model.setFeedContent(data);
            return model;
        };

        UserDataModel.prototype.toJSONObject = function() {
            return {
                "Opmls" : _.map(this.Opmls, function(Opml,i,l){
                    return Opml.toJSONObject();
                }),
                'Storis': _.map(this.Stories, function(Story,i,l){
                    return Story.toJSONObject();
                }),
                "Feeds" : _.map(this.Feeds, function(Feed,i,l){
                    return Feed.toJSONObject();
                }),
                "FeedIds"   : this.FeedIds,
                "StoryContents" : this.StoryContents,
                'email'     : this.email,
                'apiKey'    : this.apiKey
            }
        };

        UserDataModel.prototype.fromJSONObject = function(data) {
            return this.populate(data);
        };

        UserDataModel.prototype.addStoryContent = function(sc) { //story content
            this.StoryContents.push(sc);
            this.storyId2ContentMap[sc.storyId]=sc.content;
        };

        //recover the user data structure from persisted json format
        UserDataModel.prototype.setUserAuth = function(userAuth) {
            this.email = userAuth.email;
            this.apiKey = userAuth.apiKey;
        };

        UserDataModel.prototype.setFeedContent = function(feedContent) {
            me = this;
            if ('StoryContents' in feedContent) {
                _.each(feedContent.StoryContents, function(storycontent,i,l){
                    me.addStoryContent(storycontent);
                });
            }
        };

        UserDataModel.prototype.setFeedStructure = function(feedStructure) {
            var d = feedStructure;
            var i=0, len=0;
            //this.Opmls = d.Opml;
            for(i=0, len=d.Opmls.length; i < len; i++){
                var opmlJson = d.Opmls[i];
                var opml = new OpmlModel().fromJSONObject(opmlJson);
                this.Opmls.push(opml);
            }

            for(i=0, len=d.FeedIds.length; i < len; i++){
                var idItem = d.FeedIds[i];
                //build the feedId to XmlUrl map
                this.FeedId2Url[idItem.Id] = idItem.XmlUrl;
                this.FeedIds.push(idItem);
            }

            for(i=0, len=d.Stories.length; i < len; i++){
                //build the XmlUrl2Stories map
                var storyData = d.Stories[i];
                var story = new StoryModel().fromJSONObject(storyData);
                var feedId = story.FeedId;
                var feedUrl = this.FeedId2Url[feedId];
                if (!(feedUrl in this.StoriesMap)){
                    this.StoriesMap[feedUrl] = [];
                }
                this.StoriesMap[feedUrl].push(story);
                this.Stories.push(story);
            }

            for(i=0, len=d.Feeds.length; i < len; i++){
                var feedData = d.Feeds[i];
                var feed = new FeedModel().fromJSONObject(feedData);
                this.FeedsMap[feed.XmlUrl] = feed;
                this.Feeds.push(feed);
            }
        };

        UserDataModel.prototype.getStoryContentById = function(storyId) {
            if (storyId in this.storyId2ContentMap) {
                return this.storyId2ContentMap[storyId];
            }
            return null;
        };

        UserDataModel.prototype.addStories = function(storiesData) {
            var me = this;

            var newStories = _.map(storiesData, function (storyData, i) {
                return new StoryModel().fromJSONObject(storyData);
            });
            if (newStories.length>0) {
                var sampleStory = newStories[0];
                var feedId = sampleStory.FeedId;
                var feedUrl = me.FeedId2Url[feedId];
                if (!(feedUrl in me.StoriesMap)) {
                    me.StoriesMap[feedUrl] = [];
                }
                var storiesIdSet = {};
                _.each(me.StoriesMap[feedUrl], function (story, i) {
                    storiesIdSet[story.Id] = 1;
                });

                var addedStories = [];
                _.each(newStories, function(newStory, i){
                    if (storiesIdSet[newStory.id] != 1) {
                        me.StoriesMap[feedUrl].push(newStory);
                        me.Stories.push(newStory);
                        addedStories.push(newStory);
                    }
                });
                return addedStories;
            } else {
                return [];
            }
        };

        UserDataModel.prototype.getStoriesByOpml = function(opmlFeed) {
            var me = this;
            if (opmlFeed.hasOutline) {
                var outlineStories = [];
                _.each(opmlFeed.Outline,function(subOpmlFeed,i){
                    //every element of outline should be opmlFeed
                    var feedStories = me.StoriesMap[subOpmlFeed.XmlUrl];
                    outlineStories.concat(feedStories);
                });
                _.sortBy( outlineStories, function(s){
                    return s.Published
                });
                return outlineStories;
            } else{
                return this.StoriesMap[opmlFeed.XmlUrl];
            }
        };

        return UserDataModel;
    });