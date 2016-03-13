angular.module('mining.session')
    //.constant('BASE_SERVER_URL', 'http://0.0.0.0:9000')
    .constant('BASE_SERVER_URL', 'http://120.24.209.215:9000')
    //.constant('BASE_SERVER_URL', 'http://readmine.co:9000')
    .factory('SessionService', function(SessionsStorage) {
        return {
        	getAll : function () {
        		var defaultToken = null;
                var cookieStr = decodeURI(this.get('user_data'));
                if (cookieStr) {
                    defaultToken = angular.fromJson(cookieStr);
                }
                return defaultToken;
            },

            get : function (cname) {
            	var name = cname + "=";
                var ca = document.cookie.split(';');
                for(var i=0; i<ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0)==' ') c = c.substring(1);
                    if (c.indexOf(name) == 0)
                    	return c.substring(name.length,c.length);
                }
                return "";
            },
            put : function (cname, cvalue) {
        	    document.cookie += cname + "=" + cvalue + "; ";
            },
            saveAddress : function(addresses) {
            	SessionsStorage.saveAddress(addresses);
            },
            getAddresses : function() {
            	return SessionsStorage.getAddresses();
            },
            saveProfile : function(profile) {
                SessionsStorage.saveProfile(profile);
            },
            getProfile : function() {
                SessionsStorage.getProfile();
            },

            getUserPostRequest : function(path,data) {
                return {
                    method: 'POST',
                    url: path,
                    headers: {'mining': globalUserData.apiKey},
                    data: data,
                    timeout: 60000
                };
            },

            getUserGetRequest : function(path) {
                return {
                    method: 'GET',
                    url: path,
                    headers: {'mining': globalUserData.apiKey},
                    timeout: 60000
                };
            }
        };
    });