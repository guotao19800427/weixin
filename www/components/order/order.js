yunShan

    .controller('OrderController', ['$scope', 'GlobalService', 'Order', '$ionicLoading', '$rootScope', '$ionicPopup', '$state', '$stateParams', 'OrderStatus', function ($scope, GlobalService, Order, $ionicLoading, $rootScope, $ionicPopup, $state, $stateParams, OrderStatus) {
        // $ionicLoading.show();
        $stateParams.pageNumber = $stateParams.pageNumber || 1;
        $scope.pageNumber = parseInt($stateParams.pageNumber, 10);
        $scope.obj = {};
        if ($scope.pageNumber > 1) {
            $scope.obj.pre = true;
        }
        // 延迟对象
        $.when(GlobalService.checkUserStatus())
            .done(function () {
                if ($rootScope.userStatus.status === 1) {
                    //登录状态，请求列表
                    Order.getList({
                        pageNumber: $stateParams.pageNumber
                    })
                        .success(function (data) {

                            $ionicLoading.hide();
                            if (data.ret === 1) {

                                $scope.orders = data.data;
                                $scope.totalPages = data.data.total_pages;

                                for (var i = 0; i < $scope.orders.rows.length; i++) {
                                    if ($scope.orders.rows[i].status) {
                                        $scope.orders.rows[i].status = OrderStatus()[$scope.orders.rows[i].status].info;
                                    }

                                }
                                if ($scope.pageNumber < $scope.orders.total_pages) {
                                    $scope.obj.next = true;
                                }
                                //else if($scope.orders.rows.length == 0){
                                //    $scope.obj.next = false;
                                //}
                                if ($scope.totalPages == 0) {
                                    $scope.totalPages = 1;
                                }
                                //document.getElementById('pageinfo').style.display = "none";

                            }
                            else {
                                GlobalService.dealStatus($rootScope.userStatus.status);


                            }

                        })
                    return;
                }
                GlobalService.dealStatus($rootScope.userStatus.status);

            })

    }])
    .controller('confirmCreateOrderController', ['$scope', '$ionicPopup', '$ionicLoading', 'Order', '$rootScope', 'GlobalService', '$state', 'BasketSystem', function ($scope, $ionicPopup, $ionicLoading, Order, $rootScope, GlobalService, $state, BasketSystem) {
    //确认订单
    $ionicLoading.show();
    $.when(GlobalService.checkUserStatus())
        .done(function () {
            //如果门店状态为待处理或者无效
              if($rootScope.userStatus.early_period){
                    Order.getSingleDetail({
                        "earlyTime": $rootScope.userStatus.early_period,
                        "lateTime": $rootScope.userStatus.later_period
                    })
                        .success(function (data) {
                            $ionicLoading.hide();
                            $rootScope.initialCart();
                            BasketSystem.emptyBasket();
                            $ionicLoading.hide();
                            if (data.data != 0) {
                                if (data.ret === 1) {
                                    $scope.amount = data.data.order_items.length;
                                    $rootScope.cartCount = $rootScope.cartCount - $scope.amount;

                                    // 情况1 - 订单里的CI全部是限购对象并且全部不符合限购条件
                                    if ($scope.amount === 0) {

                                        var errorStr = '';
                                        for (var i = 0; i < data.data.error.length; i++) {
                                            errorStr += data.data.error[i] + '<br>'
                                        }
                                        errorStr += '请在购物车中修改数量后再次提交您的订单'
                                        $ionicPopup.alert({
                                            title: '下单失败',
                                            template: errorStr,
                                            okText: '确定'
                                        })
                                        $state.go('shopcart');
                                        return;
                                    }

                                    //情况2 - 订单里的CI部分是限购对象并且部分或全部不符合限购条件
                                    if (data.data.error.length && $scope.amount > 0) {
                                        var errorStr = '';
                                        for (var i = 0; i < data.data.error.length; i++) {
                                            errorStr += data.data.error[i] + '<br>'
                                        }
                                        $ionicPopup.alert({
                                            'title': '部分促商品下单失败',
                                            template: errorStr,
                                            okText: '确定'
                                        })
                                    }
                                }else if(data.ret === -1){
                                    var popup = $ionicPopup.alert({
                                        title: '下单失败',
                                        template: data.msg,
                                        okText    : '确定',
                                        scope : $scope
                                    });
                                    popup.then(function(res){
                                        if(res){
                                            $rootScope.cartCount = 0;
                                            $state.go('shopcart');
                                            return;
                                        }
                                    });
                                }
                            } else {
                                $state.go('shopcart');
                                $ionicPopup.alert({
                                    'title': '部分商品下单失败,请重新选择商品',
                                    okText: '确定'
                                })
                            }
                            //情况3 - 全部CI通过，继续走以下流程
                            $scope.data = data;
                        })
            }else{
                $state.go('account');
                $ionicPopup.alert({
                                    'title': '您的门店正在认证，无法下单!',
                                    okText: '确定'
                })
                $ionicLoading.hide();
            }
        })

}])
    .controller('OrderDetailController', ['$scope', 'Order', '$ionicLoading', '$stateParams', 'OrderStatus', function ($scope, Order, $ionicLoading, $stateParams, OrderStatus) {
        $ionicLoading.show();
        Order.getDetail({
            orderId: $stateParams.orderId
        })
            .success(function (data) {
                $ionicLoading.hide();
                if (data.ret === 1) {
                    $scope.data = data.data;

                    //精简最晚收货时间
                    var idx = $scope.data.expect_receive_end_time.indexOf(' ');
                    $scope.data.expect_receive_end_time = $scope.data.expect_receive_end_time.slice(idx + 1);

                    //计算每个SI的总数量
                    $scope.data.real_price = 0;
                    for (var si in $scope.data.order_items) {
                        $scope.data.order_items[si].amount = 0;
                        for (var ci in $scope.data.order_items[si].ci_items) {
                            var expect_num = parseInt($scope.data.order_items[si].ci_items[ci].expect_num, 10),
                                standard_num = parseInt($scope.data.order_items[si].ci_items[ci].standard_item_num, 10),
                                price = parseFloat($scope.data.order_items[si].ci_items[ci].price, 10),
                                weight = parseFloat($scope.data.order_items[si].weight, 10);

                            $scope.data.order_items[si].amount += parseInt($scope.data.order_items[si].ci_items[ci].expect_num, 10);

                            $scope.data.order_items[si].ci_items[ci].unit_price = Math.round(standard_num * price * weight * 100) / 100;
                            if($scope.data.order_items[si].ci_items[ci].status){

                            }
                            $scope.data.order_items[si].ci_items[ci].total_price = Math.round(standard_num * price * expect_num * weight * 100) / 100;
                            $scope.data.order_items[si].ci_items[ci].status = OrderStatus()[$scope.data.order_items[si].ci_items[ci].status].info;
                            if($scope.data.order_items[si].ci_items[ci].status != "已取消"){
                                $scope.data.real_price += Math.round(standard_num * price * expect_num * weight * 100) / 100;
                            }
                        }

                    }
                    $scope.orderStatus = OrderStatus()[$scope.data.status].info;
                }
            })
    }])