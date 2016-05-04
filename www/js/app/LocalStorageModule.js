angular.module('mining.storage', [])
    .factory('LocationsStorage', function () {
        return {
            all: function () {
                var locations = window.localStorage['locations'];
                if (locations) {
                    return angular.fromJson(locations);
                }
                return {};
            },
            save: function (locations) {
                window.localStorage['locations'] = angular.toJson(locations);
            },
            clear: function () {
                window.localStorage.removeItem('locations');
            },
            saveLocalUserData: function(){
                var gUserData = window.globalUserData.toJSONObject();
                window.localStorage['userData.global'] = JSON.stringify(gUserData);
            },
            loadLocalUserData: function () {
                var globalData = window.localStorage['userData.global'];
                var gUserData = JSON.parse(globalData);
                //window.globalUserData = UserDataModel.fromJSONObject(gUserData);
            }
        }
    })
    .factory('SessionsStorage', function () {
        return {
            getAll : function () {
                var defaultToken = null;
                var cookieStr = decodeURI(this.get('user_data'));
                if (cookieStr) {
                    defaultToken = angular.fromJson(cookieStr);
                }
                return defaultToken;
            },
            all: function () {
                var sessions = window.localStorage['sessions'];
                if (sessions) {
                    return angular.fromJson(sessions);
                }
                return {};
            },
            save: function (sessions) {
                window.localStorage['sessions'] = angular.toJson(sessions);
            },
            saveAddress: function (addresses) {
                window.localStorage['sessions.addresses'] = angular.toJson(addresses);
            },
            getAddresses: function() {
            	var addresses = window.localStorage['sessions.addresses'];
                if (addresses) {
                    return angular.fromJson(addresses);
                }
                return {};
            },
            saveProfile: function (profile) {
                window.localStorage['sessions.profile'] = angular.toJson(profile);
            },
            getProfile: function() {
                var profile = window.localStorage['sessions.profile'];
                if (profile) {
                    return angular.fromJson(profile);
                }
                return {};
            },
            clear: function () {
            	window.localStorage.removeItem('sessions.addresses');
                window.localStorage.removeItem('sessions');
            }
        }
    });