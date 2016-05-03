angular.module('mining.session')
    .constant('BASE_SERVER_URL', 'http://0.0.0.0:9000')
    //.constant('BASE_SERVER_URL', 'http://120.24.209.215:9000')
    //.constant('BASE_SERVER_URL', 'http://readmine.co:9000')
    .factory('SessionService', function(SessionsStorage, $state, $ionicPopover, $ionicPopup) {
        return {
            isUrlStartWithMine : function (xmlUrl) {
                var mineUrl = "http://readmine.co/users";
                var xmlUrlPre = xmlUrl.substring(0, mineUrl.length);
                return (xmlUrlPre === mineUrl)
            },


            apiCall: function(actionName, promise, cbOk, cbError){
                promise.then(
                    function(data){
                        if (data==1) {
                            cbOk(data);
                        }
                        else if ('error' in data && data.error!=null){
                            $ionicPopup.alert({
                                title: actionName + ' issue',
                                subtitle:data.error
                            });
                            console.log(actionName, 'error', data.error);
                            cbError();
                        }
                        else{
                            cbOk(data);
                        }
                    },
                    function(){
                        $ionicPopup.alert({
                            title: actionName + 'failed, retry later'
                        });
                        console.log(actionName, 'error')
                    }
                )

            },

            injectPopUpDiaglog: function(templateUrl, theScope) {
                $ionicPopover.fromTemplateUrl(templateUrl, {
                    scope: theScope
                }).then(function(popover) {
                    theScope.popover = popover;
                });

                theScope.openPopover = function($event) {
                    theScope.popover.show($event);
                };
                theScope.closePopover = function() {
                    theScope.popover.hide();
                };
                theScope.$on('$destroy', function() {
                    theScope.popover.remove();
                });
            },

            routeUtil : {
                goHome : function(){
                    $state.go('tab.read');
                },
                goReadTab : function(){
                    $state.go('tab.read');
                },
                goReadFeed : function ( fo ){
                    $state.go('readFeed',{opml:fo});
                },
                goReadStory : function ( s ){
                    $state.go('readStory',{story:s});
                },
                goReadAddFeed: function(){
                    $state.go('addFeed');
                },
                goReadImportFeed: function(){
                    $state.go('importFeed');
                    //$scope.closePopover();
                },
                goManageTab: function() {
                    $state.go('tab.manage');
                },
                goManageAdjust: function() {
                    $state.go('manageAdjust');
                },
                goManageReadTrend: function() {
                    $state.go('manageReadTrend');
                },
                goManageFeedTrend: function() {
                    $state.go('manageFeedTrend');
                },
                goFollowTab: function() {
                    $state.go('tab.follow');
                }
            },

            routeFullUtil : {
                goHome : function(){
                    $state.go('tab.read');
                },
                goReadTab : function(){
                    $state.go('tab.read');
                },
                goReadFeed : function ( fo ){
                    $state.go('full.readFeed',{
                        opml:fo,
                    },
                    {
                        reload: true,
                        inherit: false,
                        notify: true
                    });
                },
                goReadStory : function ( fo,s ){
                    $state.go('readStory',
                    {
                        story:s
                    },
                    {
                        reload: true,
                        inherit: false,
                        notify: true
                    });
                },
                goReadAddFeed: function(){
                    $state.go('addFeed');
                },
                goReadImportFeed: function(){
                    $state.go('importFeed');
                    //$scope.closePopover();
                },
                goManageTab: function() {
                    $state.go('tab.manage');
                },
                goManageAdjust: function() {
                    $state.go('manageAdjust');
                },
                goManageReadTrend: function() {
                    $state.go('manageReadTrend');
                },
                goManageFeedTrend: function() {
                    $state.go('manageFeedTrend');
                },
                goFollowTab: function() {
                    $state.go('tab.follow');
                }
            },

            initialized: function() {
                return typeof globalUserData !== "undefined";
            },

            refreshIfExpired: function() {
                if (typeof globalUserData === "undefined" ) {
                    $state.go('tab.read');
                }
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