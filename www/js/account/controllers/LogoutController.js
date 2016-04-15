angular.module('mining.account')
    .controller('LogoutCtrl', function(
        $scope, $ionicLoading,$state,$ionicPopup,
        AccountDataService, SessionService) {

        $scope.msg = "logging out";
        AccountDataService.wipeUserData();
        $scope.msg = "Successfully log out";

        $scope.goToLogin = function(){
            $state.go('login');
            return
        }


    });