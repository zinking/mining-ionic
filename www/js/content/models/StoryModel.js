angular.module('mining.content')
    .factory('StoryModel', function(BASE_SERVER_URL) {
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
            model.Summary   = this.stripSummary(data.Summary);
            model.Content   = model.Summary;
            return model;
        };

        StoryModel.prototype.setContent = function( contentData ) {
            this.Content = contentData;
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

        StoryModel.prototype.stripSummary = function (html)
        {
            var tmp = document.createElement("DIV");
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || "";
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

        return StoryModel;
    });