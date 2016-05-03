angular.module('mining.content')
    .factory('FeedModel', function () {
        var FeedModel = function () {

        };

        FeedModel.prototype.fitFeedTitle = function(oldTitle,len) {
            var feedTitle = oldTitle;
            if( feedTitle.length > len ){
                feedTitle = feedTitle.substring(0,len-3) + "...";
            }
            else if( feedTitle.length < len ){
                feedTitle = feedTitle+new Array(len-feedTitle.length).join(" ");
            }
            //feed.fTitle = feedTitle;
            return feedTitle;
        };

        FeedModel.prototype.populate = function(data) {
            var model = new FeedModel();
            model.Id            = data.Id;
            model.XmlUrl        = data.XmlUrl;
            model.Title         = data.Title;
            model.HtmlUrl       = data.HtmlUrl;
            model.Type          = data.Type;
            model.Image         = data.Image;
            model.Text          = data.Text;


            //--psudo element section--
            model.stories       = [];
            model.opml          = null;
            model.fTitle        = this.fitFeedTitle(model.Title,30);
            model.startFrom     = 0;
            model.unReadCount   = 0;
            model.filterHasRead = false;
            return model;
        };

        FeedModel.prototype.addStory= function(s) {
            this.stories.push(s);
            s.feed = this;
        };

        FeedModel.prototype.addStories = function(stories) {
            var me = this;
            _.each(stories, function(s){
                me.addStory(s);
            });
        };

        FeedModel.prototype.markRead = function() {
            _.each(this.stories, function(story){
                story.markRead();
            });
        };

        FeedModel.prototype.readOneStory = function() {
            this.unReadCount -= 1;
            this.opml.readOneStory();
        };

        FeedModel.prototype.getStoriesByPage = function(pageNumber) {
            var pageNo = pageNumber || 0,
                per_page = 10,
                offset = pageNo * per_page,
                stories = _.rest(this.stories, offset).slice(0, per_page);
            if (stories.length < per_page) {
                //Note: this is a signal to the caller
                //the feed is in short of stories, need to fetch more
                return [];
            } else {
                return stories;
            }
        };

        FeedModel.prototype.getStories = function() {
            return this.stories;
            //return _.sortBy(this.stories, function (s) {
            //    return -s.Published
            //});
        };






        FeedModel.prototype.fromJSONObject = function(data) {
            var ret = [];
            if (_.isArray(data)) {
                var me = this;
                _.each(data, function(item){
                    ret.push(me.populate(item));
                });
            } else {
                return this.populate(data);
            }
            return ret;
        };

        FeedModel.prototype.toJSONObject = function() {
            return {
                Id          : this.Id,
                XmlUrl      : this.XmlUrl,
                Title       : this.Title,
                HtmlUrl     : this.HtmlUrl,
                Type        : this.Type,
                Image       : this.Image,
                Text        : this.Text
            };
        };

        return FeedModel;
    });