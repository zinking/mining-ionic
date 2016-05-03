angular.module('mining.content')
    .factory('UserDataModel', function(BASE_SERVER_URL, FeedModel, StoryModel, OpmlModel) {
        var UserDataModel = function () {
            //strucutres to be persisted
            this.email = "";
            this.apiKey = "";
            this.UserActionStats = [];
            this.cleanFeedStructure();
        };

        UserDataModel.prototype.clearStats = function() {
            this.UserActionStats = [];
        };

        UserDataModel.prototype.appendUserStats = function(timestamp, action, feedId, storyId, content) {
            var userStat = {
                'TimeStamp':timestamp,
                'Action':action,
                'FeedId':feedId,
                'StoryId':storyId,
                'Content':content
            };

            this.UserActionStats.push(userStat);
        };

        UserDataModel.prototype.cleanFeedStructure = function() {
            //strucutres to be persisted
            this.Opml = [];
            this.StarOpml = [];
            this.Stories = [];
            this.Feeds = [];
            this.FeedIds = [];
            this.FeedsMap = {};
            this.AddedStories = {};
            this.FeedId2Url = {};
            this.FeedUrl2Id = {};
        };

        UserDataModel.prototype.populate = function(data) {
            var model = new UserDataModel();
            model.setFeedStructure(data);
            model.setUserAuth(data);
            return model;
        };

        UserDataModel.prototype.toJSONObject = function() {
            return {
                "Opml" : _.map(this.Opml, function(Opml){
                    return Opml.toJSONObject();
                }),
                'Storis': _.map(this.Stories, function(Story){
                    return Story.toJSONObject();
                }),
                "Feeds" : _.map(this.Feeds, function(Feed){
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

        //recover the user data structure from persisted json format
        UserDataModel.prototype.setUserAuth = function(userAuth) {
            this.email = userAuth.email;
            this.apiKey = userAuth.apiKey;
        };

        UserDataModel.prototype.setFeedStructure = function(feedStructure) {
            var me = this;
            var d = feedStructure;

            //this will be a one to many map as allow user to scatter feed around in opml structure
            var XmlUrl2OpmlMap = {};

            //Add the all feeds opml
            var allFeedsOpml = OpmlModel.prototype.createAllFeedsOpml();
            me.Opml.push(allFeedsOpml);
            XmlUrl2OpmlMap[allFeedsOpml.XmlUrl] = allFeedsOpml;


            var i, len;
            //Initialize opml data from ajax result
            for(i=0, len=d.Opml.length; i < len; i++){
                var opmlJson = d.Opml[i];
                var opml = new OpmlModel().fromJSONObject(opmlJson);
                _.each(opml.getOutlines(), function(child){
                    if (!(child.XmlUrl in XmlUrl2OpmlMap)) {
                        XmlUrl2OpmlMap[child.XmlUrl] = [child];
                    } else {
                        XmlUrl2OpmlMap[child.XmlUrl].push(child);
                    }

                });
                me.Opml.push(opml);
            }


            for(i=0, len=d.FeedIds.length; i < len; i++){
                var idItem = d.FeedIds[i];
                //build the feedId to XmlUrl map
                me.FeedId2Url[idItem.Id] = idItem.XmlUrl;
                me.FeedUrl2Id[idItem.XmlUrl] = idItem.Id;
                me.FeedIds.push(idItem);
            }

            for(i=0, len=d.Feeds.length; i < len; i++){
                //this `Feeds` object is actually opml outline, so it doesn't have Id
                //SO ID have to be mapped
                var feedData = d.Feeds[i];
                var theFeedUrl = feedData.XmlUrl;
                feedData['Id'] = me.FeedUrl2Id[theFeedUrl];
                var theFeed = new FeedModel().fromJSONObject(feedData);
                if (theFeedUrl in XmlUrl2OpmlMap) {
                    _.each(XmlUrl2OpmlMap[theFeedUrl], function(theOpml){
                        theFeed.opml = theOpml;
                        theOpml.feed = theFeed;
                    });

                    XmlUrl2OpmlMap[theFeedUrl].feed = theFeed;
                } else {
                    console.log("!!!some feed couldn't be associated", theFeed)
                }

                me.FeedsMap[theFeed.XmlUrl] = theFeed;
                me.Feeds.push(theFeed);
            }

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
                    // Note: here doesn't need to do the counter , as is already done at server side
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
                    }
                }
                me.updateOpmlUnReadCount();
            }

            //override the special `all feed` behavior
            allFeedsOpml.getFeedsUrls = function() {
                var urls = [];
                for (var theUrl in me.FeedUrl2Id) {
                    if (me.FeedUrl2Id.hasOwnProperty(theUrl)) {
                        urls.push(theUrl);
                    }
                }
                return urls;
            };

            allFeedsOpml.getStories = function() {
                var stories = [];
                for (var storyId in me.AddedStories) {
                    if (me.AddedStories.hasOwnProperty(storyId)){
                        var theStory = me.AddedStories[storyId];
                        stories.push(theStory);
                    }
                }
                return _.sortBy(stories, function (s) {
                    return -s.Published
                });
            };

            allFeedsOpml.unReadCount = me.totalUnReadCount;
        };

        UserDataModel.prototype.getFolderOpmls = function() {
            return _.filter(this.opml,function(o){ return o.hasOutline});
        };

        UserDataModel.prototype.updateOpmlUnReadCount = function() {
            var me = this;
            _.each(me.Opml, function(opmlOutline){
                opmlOutline.refreshUnreadCount();
            });
        };

        UserDataModel.prototype.populateStoryData = function(storyData) {
            var story = new StoryModel().fromJSONObject(storyData);
            var feedId = story.FeedId;
            var feedUrl = this.FeedId2Url[feedId];
            var theFeed = this.FeedsMap[feedUrl];

            if (this.AddedStories[story.Id]!=null) {
                return null;
            } else {
                //else add it to the collection and feed
                if (story.Published<theFeed.startFrom) {
                    story.isRead = true;
                }
                this.Stories.push(story);
                this.AddedStories[story.Id] = story;
                theFeed.addStory(story);
            }

            return story;
        };

        UserDataModel.prototype.addStories = function(storiesData,UserReadStoryIds,UserStarStoryIds) {
            var me = this;
            var newAddedStories = [];
            _.each(storiesData, function(newStoryData){
                var addedStory = me.populateStoryData(newStoryData);
                if (addedStory!=null) {
                    newAddedStories.push(addedStory);
                }
            });

            var theStoryId = 0,
                i, len,
                theStory = null;

            for(i=0, len=UserReadStoryIds.length; i < len; i++) {
                theStoryId = UserReadStoryIds[i];
                theStory = me.AddedStories[theStoryId];
                theStory.isRead = true;
            }

            for(i=0, len=UserStarStoryIds.length; i < len; i++) {
                theStoryId = UserStarStoryIds[i];
                theStory = me.AddedStories[theStoryId];
                theStory.isStar = true;
            }

            return newAddedStories;
        };

        return UserDataModel;
    });