angular.module('mining.content')
    .factory('FeedModel', function(BASE_SERVER_URL) {
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
            model.fTitle        = this.fitFeedTitle(model.Title,30);
            return model;
        };

        FeedModel.prototype.fromJSONObject = function(data) {
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