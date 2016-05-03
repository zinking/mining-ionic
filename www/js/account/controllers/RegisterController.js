angular.module('mining.account')
    .controller('RegisterCtrl', function( $scope, $ionicLoading,$state,$ionicPopup, AccountDataService) {
        $scope.viewModel = {
            email  : '',
            pass1  : '',
            pass2  : ''
        };

        $scope.register = function(){
            if ($scope.viewModel.pass1 != $scope.viewModel.pass2) {
                $ionicPopup.alert({
                    title: 'Passwords Invalid,Retry'
                });
            }
            else{
                AccountDataService.register($scope.viewModel.email,$scope.viewModel.pass1).then(
                    function(data){
                        if (data.error != null){
                            $ionicPopup.alert({
                                title: 'Register issue',
                                subtitle: data.error
                            });
                        }
                        else{
                            $ionicPopup.alert({
                                title: 'Register Success,go login!'
                            });
                            $state.go('login');
                        }

                    },
                    function(){
                        $ionicPopup.alert({
                            title: 'Register Error,Retry later'
                        });
                    },
                    function(){}
                )
            }

        }
    });