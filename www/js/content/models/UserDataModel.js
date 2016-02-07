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
            this.Opml = [];
            this.Stories = [];
            this.Feeds = [];
            this.FeedIds = [];
            this.StoryContents = [];
            //structurs to be used efficiently
            this.StoriesMap = {};  //feed xml url to stories list
            this.FeedsMap = {};    //feed xml url to feed conent
            this.AddedStories = {};
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
                "Opml" : _.map(this.Opml, function(Opml,i,l){
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
            var me = this;
            if ('StoryContents' in feedContent) {
                _.each(feedContent.StoryContents, function(storycontent,i,l){
                    me.addStoryContent(storycontent);
                });
            }
        };

        UserDataModel.prototype.setFeedStructure = function(feedStructure) {
            var me = this;
            var d = feedStructure;
            var i=0, len=0;
            //this.Opml = d.Opml;
            for(i=0, len=d.Opml.length; i < len; i++){
                var opmlJson = d.Opml[i];
                var opml = new OpmlModel().fromJSONObject(opmlJson);
                this.Opml.push(opml);
            }

            for(i=0, len=d.FeedIds.length; i < len; i++){
                var idItem = d.FeedIds[i];
                //build the feedId to XmlUrl map
                this.FeedId2Url[idItem.Id] = idItem.XmlUrl;
                this.FeedIds.push(idItem);
            }

            for(i=0, len=d.Feeds.length; i < len; i++){
                var feedData = d.Feeds[i];
                var feed = new FeedModel().fromJSONObject(feedData);
                this.FeedsMap[feed.XmlUrl] = feed;
                this.Feeds.push(feed);
            }

            for(i=0, len=d.Stories.length; i < len; i++){
                //build the XmlUrl2Stories map
                var storyData = d.Stories[i];
                me.populateStoryData(storyData);
            }
        };

        UserDataModel.prototype.populateStoryData = function(storyData) {
            var me = this;
            var story = new StoryModel().fromJSONObject(storyData);
            if (me.AddedStories[story.Id]!=null) {
                return null;
            }
            var feedId = story.FeedId;
            var feedUrl = me.FeedId2Url[feedId];
            var feed = me.FeedsMap[feedUrl];
            story.FeedTitle = feed.Title;

            if (!(feedUrl in me.StoriesMap)){
                this.StoriesMap[feedUrl] = [];
            }
            me.StoriesMap[feedUrl].push(story);
            me.Stories.push(story);
            me.AddedStories[story.Id] = story;
            return story;
        };

        UserDataModel.prototype.getStoryContentById = function(storyId) {
            if (storyId in this.storyId2ContentMap) {
                return this.storyId2ContentMap[storyId];
            }
            return null;
        };

        UserDataModel.prototype.addStories = function(storiesData) {
            var me = this;
            var newAddedStories = [];
            _.each(storiesData, function(newStoryData,i){
                var addedStory = me.populateStoryData(newStoryData);
                if (addedStory!=null) {
                    newAddedStories.push(addedStory);
                }
            });
            _.sortBy(newAddedStories, function(story){
                return story.Published
            });
            return newAddedStories;
        };

        UserDataModel.prototype.getStoriesByOpml = function(opmlFeed) {
            var me = this;
            if (opmlFeed.hasOutline) {
                var outlineStories = [];
                _.each(opmlFeed.Outline,function(subOpmlFeed,i){
                    //every element of outline should be opmlFeed
                    var feedStories = me.StoriesMap[subOpmlFeed.XmlUrl];
                    if (feedStories instanceof Array) {
                        outlineStories = outlineStories.concat(feedStories);
                    }
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