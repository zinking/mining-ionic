angular.module('mining.account')
    .factory('AccountModel', function(BASE_SERVER_URL) {
        var AccountModel = function () {
            this.id = -1; // -1 by default. It means creating a new object to the backend.
            this.name = null;
            this.telephone = null;
            this.school = null;
            this.address = null;
            this.gender = null;
            this.language = null;
            this.country = null;
            this.province = null;
            this.city = null;
            this.avatarurl = null;
        };
        
        AccountModel.prototype.getAvatarUrl = function() {
        	return BASE_SERVER_URL + avatarurl;
        };

        AccountModel.prototype.populate = function(data) {
        	var model = new AccountModel();
        	model.id        = data.id;
        	model.name      = data.name;
            model.telephone = data.telephone;
            model.school    = data.school;
            model.address   = data.address;
            model.gender    = data.gender;
            model.language  = data.language;
            model.country   = data.country;
            model.province  = data.province;
            model.city      = data.city;
            model.avatarurl = data.avatarurl;
            return model;
        };

        AccountModel.prototype.fromJSONObject = function(data) {
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
        
        AccountModel.prototype.toJSONObject = function() {
            return {
                id        : this.id,
                name      : this.name,
                telephone : this.telephone,
                school    : this.school,
                address   : this.address,
                gender    : this.gender,
                language  : this.language,
                country   : this.country,
                province  : this.province,
                city      : this.city,
                avatarurl : this.avatarurl
            };
        };

        return AccountModel;
    });