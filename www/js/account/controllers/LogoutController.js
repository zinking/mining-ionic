angular.module('mining.account')
    .controller('LogoutCtrl', function( $scope, $state, AccountDataService) {

        $scope.msg = "logging out";
        AccountDataService.wipeUserData();
        $scope.msg = "Successfully log out";

        $scope.goToLogin = function(){
            $state.go('login');
        }
    });