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
            this.StarOpml = [];
            this.Stories = [];
            this.Feeds = [];
            this.FeedIds = [];
            this.StoryContents = [];
            //structurs to be used efficiently
            this.StoriesMap = {};  //feed xml url to stories list
            this.FeedsMap = {};    //feed xml url to feed conent
            this.AddedStories = {};
            this.FeedId2Url = {};
            this.FeedUrl2Id = {};
            this.Feed2OpmlMap = {};
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
            var story = this.AddedStories[sc.storyId];
            story.setSummary(sc.summary);
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

        UserDataModel.prototype.setStarFeedStructure = function(feedStructure) {
            var me = this;
            var d = feedStructure;
            var i=0, len=0;
            //this.Opml = d.Opml;
            for(i=0, len=d.StarOpml.length; i < len; i++){
                var opmlJson = d.StarOpml[i];
                var opml = new OpmlModel().fromJSONObject(opmlJson);
                me.StarOpml.push(opml);
            }

            for(i=0, len=d.FeedIds.length; i < len; i++){
                var idItem = d.FeedIds[i];
                //build the feedId to XmlUrl map
                me.FeedId2Url[idItem.Id] = idItem.XmlUrl;
                me.FeedUrl2Id[idItem.XmlUrl] = idItem.Id;
                me.FeedIds.push(idItem);
            }

            for(i=0, len=d.Feeds.length; i < len; i++){ //TODO: this feeds object is actually opmloutline, so it doesn't have Id
                var feedData = d.Feeds[i];
                feedData['Id'] = me.FeedUrl2Id[feedData.XmlUrl];
                var feed = new FeedModel().fromJSONObject(feedData);
                me.FeedsMap[feed.XmlUrl] = feed;
                me.Feeds.push(feed);
            }

            if ('Stories' in d) {
                for (i = 0, len = d.Stories.length; i < len; i++) {
                    //build the XmlUrl2Stories map
                    var storyData = d.Stories[i];
                    me.populateStoryData(storyData);
                }
            }

            //deal with user feed read stat
            /*me.totalUnReadCount = 0;
            for(i=0, len=d.UserReadFeedStats.length; i < len; i++) {
                var userReadFeedStat = d.UserReadFeedStats[i];
                var feedId = userReadFeedStat.FeedId;
                var feedUrl = me.FeedId2Url[feedId];
                var feed = me.FeedsMap[feedUrl];
                feed.unReadCount = userReadFeedStat.UnreadCount;
                feed.startFrom = userReadFeedStat.StartFrom;
                me.totalUnReadCount += feed.unReadCount;
                me.updateStoryReadStatusUseStartFromTime(feedUrl,feed.startFrom);
            }*/
            me.createFeed2OpmlMap();
            me.updateOpmlUnReadCount();

            //deal with read stories
            if ('UserReadStoryIds' in d) {
                for (i = 0, len = d.UserReadStoryIds.length; i < len; i++) {
                    var storyId = d.UserReadStoryIds[i];
                    var story = me.AddedStories[storyId];
                    story.isRead = true;
                }
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
                me.Opml.push(opml);
            }

            for(i=0, len=d.FeedIds.length; i < len; i++){
                var idItem = d.FeedIds[i];
                //build the feedId to XmlUrl map
                me.FeedId2Url[idItem.Id] = idItem.XmlUrl;
                me.FeedUrl2Id[idItem.XmlUrl] = idItem.Id;
                me.FeedIds.push(idItem);
            }

            for(i=0, len=d.Feeds.length; i < len; i++){ //TODO: this feeds object is actually opmloutline, so it doesn't have Id
                var feedData = d.Feeds[i];
                feedData['Id'] = me.FeedUrl2Id[feedData.XmlUrl];
                var feed = new FeedModel().fromJSONObject(feedData);
                me.FeedsMap[feed.XmlUrl] = feed;
                me.Feeds.push(feed);
            }
            me.createFeed2OpmlMap();

            if ('Stories' in d) {
                for(i=0, len=d.Stories.length; i < len; i++){
                    //build the XmlUrl2Stories map
                    var storyData = d.Stories[i];
                    me.populateStoryData(storyData);
                }
            }



            if ('UserReadStoryIds' in d) {
                //deal with read stories
                for(i=0, len=d.UserReadStoryIds.length; i < len; i++) {
                    var storyId = d.UserReadStoryIds[i];
                    var story = me.AddedStories[storyId];
                    story.isRead = true;
                }
            }

            if ('UserReadFeedStats' in d) {
                //deal with user feed read stat
                me.totalUnReadCount = 0;
                for(i=0, len=d.UserReadFeedStats.length; i < len; i++) {
                    var userReadFeedStat = d.UserReadFeedStats[i];
                    var feedId = userReadFeedStat.FeedId;
                    var feedUrl = me.FeedId2Url[feedId];
                    if (feedUrl in me.FeedsMap) {
                        var feed = me.FeedsMap[feedUrl];
                        feed.unReadCount = userReadFeedStat.UnreadCount;
                        feed.startFrom = userReadFeedStat.StartFrom;
                        me.totalUnReadCount += feed.unReadCount;
                        //because story data is nolonger populated from start
                        //me.updateStoryReadStatusUseStartFromTime(feedUrl,feed.startFrom);
                    }
                }
                me.updateOpmlUnReadCount();
            }
        };

        //UserDataModel.prototype.updateStoryReadStatusUseStartFromTime = function( feedUrl, startFrom){
        //    var stories = this.StoriesMap[feedUrl];
        //    _.each(stories, function(story,i){
        //        if (story.Published<startFrom) { //if the story is published before user's focus, mark it read
        //            story.isRead = true;
        //        }
        //    });
        //};

        UserDataModel.prototype.createFeed2OpmlMap = function() {
            var me = this;
            for(i=0, len=me.Opml.length; i<len; i++) {
                var opmlOutline = me.Opml[i];
                var opmlUnreadCount = 0;
                var outlines = opmlOutline.getOutlines();
                _.each(outlines, function(outline,i){
                    var feedUrl = outline.XmlUrl;
                    var feed = me.FeedsMap[feedUrl];
                    me.Feed2OpmlMap[feedUrl] = opmlOutline;
                });
            }
        };

        UserDataModel.prototype.markStoryRead = function(story) {
            me = this;
            story.isRead = true;
            var feedId = story.FeedId;
            var feedUrl = me.FeedId2Url[feedId];
            var feed = me.FeedsMap[feedUrl];
            var opml = me.Feed2OpmlMap[feedUrl];
            feed.unReadCount -= 1;
            opml.unReadCount -= 1;
            me.totalUnReadCount -=1;
        };

        UserDataModel.prototype.markStoryStar = function(story) {
            me = this;
            story.isStar = true;
        };

        UserDataModel.prototype.updateOpmlUnReadCount = function() {
            var me = this;
            for(i=0, len=me.Opml.length; i<len; i++) {
                var opmlOutline = me.Opml[i];
                var opmlUnreadCount = 0;
                var outlines = opmlOutline.getOutlines();
                _.each(outlines, function(outline,i){
                    var feedUrl = outline.XmlUrl;
                    var feed = me.FeedsMap[feedUrl];
                    outline.unReadCount = feed.unReadCount;
                    opmlUnreadCount += feed.unReadCount;
                });
                opmlOutline.unReadCount = opmlUnreadCount;
            }
        };

        UserDataModel.prototype.populateStoryData = function(storyData) {
            var me = this;
            var story = new StoryModel().fromJSONObject(storyData);
            var feedId = story.FeedId;
            var feedUrl = me.FeedId2Url[feedId];
            var feed = me.FeedsMap[feedUrl];
            story.FeedTitle = feed.Title;

            if (!(feedUrl in me.StoriesMap)){
                this.StoriesMap[feedUrl] = [];
            }

            // if the story is already added then do nothing
            if (me.AddedStories[story.Id]!=null) {
                return null;
            } else {
                //else add it to the collection and feed
                if (story.Published<feed.startFrom) {
                    story.isRead = true;
                }
                me.Stories.push(story);
                me.AddedStories[story.Id] = story;
                me.StoriesMap[feedUrl].push(story);
            }

            return story;
        };

        UserDataModel.prototype.getStoryContentById = function(storyId) {
            if (storyId in this.storyId2ContentMap) {
                return this.storyId2ContentMap[storyId];
            }
            return null;
        };

        UserDataModel.prototype.getStoryById = function(storyId) {
            if (storyId in this.AddedStories) {
                return this.AddedStories[storyId];
            }
            return null;
        };


        UserDataModel.prototype.addStories = function(storiesData,UserReadStoryIds,UserStarStoryIds) {
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

            for(i=0, len=UserReadStoryIds.length; i < len; i++) {
                var storyId = UserReadStoryIds[i];
                var story = me.AddedStories[storyId];
                story.isRead = true;
            }

            for(i=0, len=UserStarStoryIds.length; i < len; i++) {
                var storyId = UserStarStoryIds[i];
                var story = me.AddedStories[storyId];
                story.isStar = true;
            }

            return newAddedStories;
        };

        //mark stories in the specified feed as read
        UserDataModel.prototype.markFeedStoriesRead = function(xmlUrl) {
            //var feed = this.FeedsMap[xmlUrl];
            // probably update the feed stats as well??
            var stories = this.StoriesMap[xmlUrl];
            _.each(stories, function(story,i){
                story.isRead = true;
            })
        };

        //get local cached story for the specified feed
        UserDataModel.prototype.getLocalStoriesPerFeed = function(xmlUrl, pageNo) {
            var me = this;
            //let's use the current page size say 10
            var feedStories = me.StoriesMap[xmlUrl];
            if (feedStories instanceof Array) {
                var pageNo = pageNo || 0,
                    per_page = 10,
                    offset = pageNo * per_page,
                    stories = _.rest(feedStories, offset).slice(0, per_page);
                if (stories.length < per_page) {
                    return [];
                } else {
                    return stories;
                }
            }

            return [];
        };

        //get local cached stories for the specified feeds *feeds*
        //if one of the feed cache returned empty, then the whole call return empty
        UserDataModel.prototype.getLocalStories = function(xmlUrls, pageNo) {
            var me = this;
            var allFeedsStories = [];
            _.each(xmlUrls, function(xmlUrl,i){
                var feedStories = me.getLocalStoriesPerFeed(xmlUrl, pageNo);
                if (feedStories.length == 0) {
                    return [];
                } else {
                    allFeedsStories = allFeedsStories.concat(feedStories);
                }
            });
            _.sortBy( allFeedsStories, function(s){
                return s.Published
            });
            return allFeedsStories;
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