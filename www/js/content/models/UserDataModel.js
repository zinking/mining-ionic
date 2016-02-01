angular.module('mining.content')
    .factory('UserDataModel', function(BASE_SERVER_URL) {
        var UserDattaModel = function () {

        };

        UserDattaModel.prototype.getAvatarUrl = function() {
        	return BASE_SERVER_URL + avatarurl;
        };



        return UserDattaModel;
    });