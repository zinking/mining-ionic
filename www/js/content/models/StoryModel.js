angular.module('mining.content')
    .factory('StoryModel', function () {
        var StoryModel = function () {

        };

        StoryModel.prototype.populate = function(data) {
            var model = new StoryModel();
            model.Id        = data.Id;
            model.FeedId    = data.FeedId;
            model.Title     = data.Title;
            model.Link      = data.Link;
            model.Updated   = data.Updated;
            model.Published = data.Published;
            model.Author    = data.Author;
            //model.Summary   = data.Summary;
            model.setSummary(data.Summary);
            model.Content   = null;
            model.PublishedTime = new Date(model.Published);

            // -psudo element section --
            model.isRead    = false;
            model.isStar    = false;
            model.feed      = null;

            return model;
        };

        StoryModel.prototype.markRead = function() {
            this.isRead = true;
            this.feed.readOneStory();
        };

        StoryModel.prototype.markStar = function() {
            this.isStar = true;
            //TODO: add the story to the star opml
        };



        StoryModel.prototype.fromJSONObject = function(data) {
            var me = this;
            var ret = [];
            if (_.isArray(data)) {
                _.each(data, function(item){
                    ret.push(me.populate(item));
                });
            } else {
                return this.populate(data);
            }

            return ret;
        };

        StoryModel.prototype.setSummary = function (summary) {
            this.SSummary   = this.stripSummary(summary);
            this.Summary   = summary;
        };

        StoryModel.prototype.stripSummary = function (html)
        {
            var tmp = document.createElement("DIV");
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || "";
        };

        StoryModel.prototype.setContent = function( contentData ) {
            if (contentData !== null && contentData !== "") {
                this.Content = contentData;
            } else {
                this.Content = this.Summary;
            }
        };

        StoryModel.prototype.toJSONObject = function() {
            return {
                Id          : this.Id,
                FeedId      : this.FeedId,
                Link        : this.Link,
                Updated     : this.Updated,
                Published   : this.Published,
                Author      : this.Author,
                Summary     : this.Summary,
                Content     : this.Content
            };
        };

        StoryModel.prototype.hasContent = function() {
            return  this.Content != null && this.Content !== "";
        };

        return StoryModel;
    });