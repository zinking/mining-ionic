angular.module('mining.account')
    .controller('LoginCtrl', function($scope, $ionicLoading,$state,$ionicPopup, AccountDataService, SessionService) {
        $scope.router = SessionService.routeUtil;

        $scope.viewModel = {
            email : '',
            pass  : ''
        };

        $scope.login = function(){
            AccountDataService.login($scope.viewModel.email,$scope.viewModel.pass).then(
                function(){
                    $scope.router.goHome();
                    return
                },
                function(){
                    $ionicPopup.alert({
                        title: 'Login Failed,Retry'
                    });
                },
                function(){

                }
            )
        };

        $scope.goRegister = function(){
            $state.go('register')
        }
    });