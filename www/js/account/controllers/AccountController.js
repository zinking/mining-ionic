angular.module('mining.account')
    .controller('AccountCtrl', function($scope, $ionicLoading, AccountDataService, SessionService) {
        $scope.settings = {};

        $scope.viewModel = {
            account : {},
            isStaff : false,
            storage : '',
            location : null,
            loading : $ionicLoading.show({
                template: '<i class="icon ion-loading-c"></i>加载中...',
                showBackdrop: false,
                showDelay: 10
            })
        };

    });