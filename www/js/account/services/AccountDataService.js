angular.module('mining.account')
    .factory('AccountDataService', function($http,
                                            $q,
                                            AccountModel,
                                            SessionService,
    										BASE_SERVER_URL) {
        var USER_LOGIN_PATH  = BASE_SERVER_URL + '/loginApi'

        return {
        	_data : {},
            getUserData : function() {
                if( 'userData' in window.localStorage){
                    var userData = window.localStorage['userData'];
                    return JSON.parse(userData);
                }
                else{
                    return "";
                }
            },
            login : function ( email, pass ) {
                var deferred = $q.defer();
                var promise = deferred.promise;
                var me = this;
                var loginData = {"email":email,"pass":pass}

                var req = {
                    method: 'POST',
                    url: USER_LOGIN_PATH,
                    data: loginData,
                    timeout: 5000
                }

                $http(req).
                    success(function (d) {
                        userData ={
                            'email':email,
                            'apiKey': d.apiKey
                        }
                        window.localStorage['userData'] = JSON.stringify(userData);
                        deferred.resolve();
                    }).
                    error(function () {
                        window.localStorage['userData'] = '';
                        deferred.reject();
                    });

                return promise;
            }
        };
    });