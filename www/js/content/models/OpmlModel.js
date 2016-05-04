angular.module('mining.content')
    .factory('OpmlModel', function (FeedModel) {
        var OpmlModel = function () {

        };

        OpmlModel.prototype.populate = function(data) {
            var model = new OpmlModel();
            model.XmlUrl        = data.XmlUrl;
            model.Title         = data.Title;
            model.HtmlUrl       = data.HtmlUrl;
            model.Type          = data.Type;
            model.Image         = data.Image;
            model.Text          = data.Text;

            // psudo element
            model.unReadCount   = 0;
            model.currentPage   = 0;
            model.parentOpml    = null;
            model.Outline       = [];

            // Structure section
            model.feed = null;
            if ('Outline' in data){
                model.Outline   = _.map(data.Outline, function(omplData){
                    var childOpml = OpmlModel.prototype.fromJSONObject(omplData);
                    childOpml.parentOpml = model;
                    return childOpml;
                });
            } else {
                model.parentOpml = model;
            }

            model.filterHasRead = false;
            model.isOpen = false;
            return model;
        };

        OpmlModel.prototype.createAllFeedsOpml = function() {
            var model = new OpmlModel();
            model.XmlUrl        = "http://readmine.co/feeds?all=true";
            model.Title         = "All Feeds";
            model.HtmlUrl       = "http://readmine.co/feeds?all=true";
            model.Type          = "RSS/ALL";
            model.Image         = "N/A";
            model.Text          = "All Feeds";

            model.unReadCount   = 0;
            model.currentPage   =  0;
            model.filterHasRead = false;
            model.feed          = new FeedModel();
            model.parentOpml    = model;
            model.Outline       = [];

            return model;
        };
        OpmlModel.prototype.isFolder = function() {
            return this.Outline.length > 0;
        };

        OpmlModel.prototype.readOneStory = function() {
            this.unReadCount -= 1;
            if (!this.isFolder()) { //if the opml is not folder prop upwards
                if (this.parentOpml != null) {
                    this.parentOpml.readOneStory();
                }
            }
        };

        OpmlModel.prototype.markRead = function() {
            if (this.isFolder()) {
                _.each(this.Outline, function(child){
                    child.markRead();
                })
            } else {
                this.feed.markRead();
            }
        };

        OpmlModel.prototype.getStories = function() {
            if (this.isFolder()) {
                var stories = [];
                _.each(this.Outline, function(child){
                    stories = stories.concat(child.feed.getStories());
                });
                return _.sortBy(stories, function (s) {
                    return -s.Published
                });
            } else {
                return this.feed.getStories();
            }
        };


        OpmlModel.prototype.refreshUnreadCount = function() {
            if (this.isFolder()) {
                var me = this;
                this.unReadCount = _.sum(
                    _.map(me.Outline, function (child) {
                        child.refreshUnreadCount();
                        return child.unReadCount;
                    })
                );
            } else {
                this.unReadCount = this.feed.unReadCount;
            }
        };

        OpmlModel.prototype.getFeedsUrls = function() {
            var me = this;
            if (me.isFolder()) {
                return _.map(me.Outline, function(opmlOutline){
                    return opmlOutline.XmlUrl;
                });
            } else {
                return [me.XmlUrl];
            }
        };

        OpmlModel.prototype.getOutlines = function() {
            if (this.isFolder()) {
                return this.Outline;
            } else {
                return [this];
            }
        };

        OpmlModel.prototype.fromJSONObject = function(data) {
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

        OpmlModel.prototype.toJSONObject = function() {
            var obj = {
                XmlUrl      : this.XmlUrl,
                Title       : this.Title,
                HtmlUrl     : this.HtmlUrl,
                Type        : this.Type,
                Image       : this.Image,
                Text        : this.Text
            };
            if (this.isFolder()){
                obj.Outline = _.map(this.Outline, function(child){
                    return child.toJSONObject();
                });
            } else {
                return obj;
            }
        };

        return OpmlModel;
    });