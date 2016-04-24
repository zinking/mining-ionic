angular.module('mining.content')
    .factory('OpmlModel', function(BASE_SERVER_URL) {
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
            model.hasOutline    = false;
            model.unReadCount   = 0;
            model.currentPage   =  0;
            if ('Outline' in data){

                model.Outline   = _.map(data.Outline, function(omplData,i){
                    return OpmlModel.prototype.fromJSONObject(omplData);
                });
                if (model.Outline.length>0) {
                    model.hasOutline = true;
                }
            }
            model.filterHasRead = false;
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
            model.hasOutline    = true;
            model.unReadCount   = 0;
            model.currentPage   =  0;
            model.filterHasRead = false;

            return model;
        };

        OpmlModel.prototype.getFeedsUrls = function() {
            var me = this;
            if (me.hasOutline) {
                return _.map(me.Outline, function(opmlOutline,i){
                    return opmlOutline.XmlUrl;
                });
            } else {
                return [me.XmlUrl];
            }
        };

        OpmlModel.prototype.getOutlines = function() {
            var me = this;
            if (me.hasOutline) {
                return _.map(me.Outline, function(suboutline,i){
                    return suboutline;
                });
            } else {
                return [me];
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
            if (this.hasOutline){
                obj.Outline = _.map(this.Outline, function(ompl,i){
                    return opml.toJSONObject();
                });
            } else {
                return obj;
            }
        };

        return OpmlModel;
    });