yunShan

.controller('ShopcartController', ['$scope', 'GlobalService', '$rootScope', '$ionicPopup', 'Shopcart', '$ionicLoading', '$state', 'PicURL', 'BasketSystem', function ($scope, GlobalService, $rootScope, $ionicPopup, Shopcart, $ionicLoading, $state, PicURL, BasketSystem){
	$scope.obj = {};
	$scope.picURL = PicURL;
	$ionicLoading.show();
	//向后端请求购物车信息
	$.when( GlobalService.checkUserStatus() )
		.done( function (){
			//注册用户
			if($rootScope.userStatus.status ===1){
				$ionicLoading.show();

				GlobalService.getShopcartRegister()
					.success( function (data){
						$ionicLoading.hide();
						if(data.ret ===1){
							$scope.cart = {
								"list"        : data.data.items,
								"totalNumber" : 0,
								"totalPrice"  : data.data.total_price
							}
							if($.isEmptyObject($scope.cart.list)){
								$scope.obj.noItem = true;
                                $rootScope.cartCount = $scope.cart.list.length;
							}
							else{
								for(var si in $scope.cart.list){
                                    for (var ci in $scope.cart.list[si]['ci_items']){
                                        $scope.cart.totalNumber += 1;
                                        var price = parseFloat($scope.cart.list[si]['ci_items'][ci].price),
											count = parseInt($scope.cart.list[si]['ci_items'][ci].standard_item_num, 10),
											count1 = parseInt($scope.cart.list[si]['weight'], 10);
                                        $scope.cart.list[si]['ci_items'][ci].unit_price = Math.round(price * count * count1 * 100) / 100;
                                        $scope.cart.list[si]['ci_items'][ci].num = parseInt($scope.cart.list[si]['ci_items'][ci].num, 10)
                                    }
                                }
                                $rootScope.cartCount = $scope.cart.totalNumber;
                            }

						}
					} )
				return;
			}
			GlobalService.dealStatus($rootScope.userStatus.status);

		})
	//点击加号或者减号的函数 num是没改变后的值
	$scope.changeNumber = function (standardId, commdityId, commdityNumber,num){
		if(commdityNumber < 0 || commdityNumber === null || commdityNumber>9999){
			return;
		}
		$ionicLoading.show();
		Shopcart.plusOrMinus({
			"commdityId"     : commdityId,
			"commdityNumber" : commdityNumber
		})
			.success(function(data){
				$ionicLoading.hide();
                             if(commdityNumber >num){
                                if(data.data.flag){
                                    if(data.data.flag != '0'&&data.data.flag != '1'){
                                        $ionicPopup.alert({
                                            title:data.data.msg,
                                            okText:'确定'
                                        });
                                    }else if (data.data.flag=='1'){
                                        var popConfirm = $ionicPopup.confirm({
                                            title     : '提示',
                                            template  : data.data.msg,
                                            okText    : '确定',
                                            cancelText : '取消',
                                            scope : $scope
                                        });
                                        popConfirm.then(function(res){
                                            if(res){
                                                    Shopcart.delCartInfo().success(function(data){
                                                    if (data.ret === 1&&data.data!=0) {
                                                            $scope.cart.totalNumber = 0;
                                                            $scope.cart.totalPrice = 0;
                                                            for(var si in $scope.cart.list){
                                                                for (var ci in $scope.cart.list[si]['ci_items'])
//                                                                    GlobalService.syncCart(ci,ci);
                                                                    if($scope.cart.list[si]['ci_items'][ci].num !== 0){
                                                                        $scope.cart.totalNumber +=1;
                                                                        $scope.cart.totalPrice += Math.ceil(($scope.cart.list[si]['ci_items'][ci].unit_price * 100) * $scope.cart.list[si]['ci_items'][ci].num )
                                                                    }
                                                            }
                                                            $rootScope.cartCount = $scope.cart.totalNumber;
                                                            $scope.cart.totalPrice = $scope.cart.totalPrice / 100;
                                                            history.go(0);
                                                    }
                                                    //如果删除后，购物车为空，提示不能下单，并且清空购物车
                                                    if(data.ret==1&&data.data==0){
                                                                $ionicPopup.alert({
                                                                    title  : '删除商品后，购物车为空，不能下单！',
                                                                    okText : '确定'
                                                                });
                                                                $scope.cart = {
                                                                    "list": {},
                                                                    "totalNumber": 0,
                                                                    "totalPrice": 0
                                                                }
                                                                $scope.obj.empty = true;
                                                                $rootScope.cartCount = 0;
                                                                $scope.obj.noItem = true;
                                                     }

                                                });

                                            }
                                        })
                                    }
                                }else{
                                    $scope.cart.list[standardId]['ci_items'][commdityId].num = commdityNumber;
				}
				$scope.syncPriceAndNumber();
                             }else{
                                  $scope.cart.list[standardId]['ci_items'][commdityId].num = commdityNumber;
                                  $scope.syncPriceAndNumber();
                             }
			})
	}
	// 点击输入框，scope保存commdity ID, 弹出修改窗口

	$scope.inputFocus = function (standardId, commdityId, commdityNumber){
        $scope.obj = {
			'id'     : commdityId,
			'number' : commdityNumber
		};
		var popup = $ionicPopup.confirm({
			title     : '请输入您要购买的数量',
			template  : '<input type="tel" ng-model="obj.number" autofocus>',
			okText    : '确定',
			cancelText : '取消',
			scope : $scope
		});
		popup.then(function(res){

			if($.type($scope.obj.number) !== 'number'){
				$scope.obj.number = parseInt($scope.obj.number, 10);

			}
			if(!$scope.obj.number){
				$scope.obj.number = 0;
			}
            if($scope.obj.number>9999){
                $scope.obj.number = 9999;
            }
			if(res){
				$scope.changeNumber(standardId, $scope.obj.id, $scope.obj.number,commdityNumber);
			}
		})

	}
	// 清空购物车
	$scope.emptyCart = function(){
        var popup = $ionicPopup.confirm({
            title     : '确定要清空购物车的全部菜品吗？',
            okText    : '确定',
            cancelText : '取消',
            scope : $scope
        });

        popup.then(function(res){
            if(res){
            Shopcart.emptyCart()
                .success(function (data) {
                    if (data.ret === 1) {
                        $scope.cart = {
                            "list": {},
                            "totalNumber": 0,
                            "totalPrice": 0
                        }
                        $scope.obj.empty = true;
                        $rootScope.cartCount = 0;
                    }
                })
            }else{
                return;
            }
        });
	}
	//下订单
	$scope.buy = function (){
		if($scope.cart.totalPrice === 0){
			$ionicPopup.alert({
				title  : '您的购物车目前没有任何物品',
				okText : '确定'
			});
			return;
		}
		// console.log($scope.cart);
		// console.log(BasketSystem.basket);
		// for(var item in $scope.cart.list){
		// 	console.log(item);
		// 	BasketSystem.basket[item]= {};
		// 	BasketSystem.basket[item].amount = $scope.cart.list[item].num;
		// 	BasketSystem.basket[item].price = $scope.cart.list[item].price;
		// 	BasketSystem.basket[item].id = $scope.cart.list[item].lu_commodity_item_id;
		// }
		// console.log(BasketSystem.basket);
        GlobalService.getVerificationShopcart()
            .success( function (data){
                if (data.ret === 1) {
                    $state.go('confirmOrder');
                }else{
                    var popup = $ionicPopup.confirm({
                        title     : '提示',

                        //modify by yinkw 2015-05-14 把超限量的提示以及下架、超时放到了一起，改为下单失败，并增加换行
                        template  : '以下商品无法下单:<br/><br/>'+data.msg+"<br/><br/>是否删除商品继续下单？",
                        //modify end

                        okText    : '删除并下单',
                        cancelText : '返回购物车',
                        scope : $scope
                    });
                    popup.then(function(res){
                        if(res){
                                Shopcart.delCartInfo().success(function(data){
                                    
                                    if (data.ret === 1&&data.data!=0) {
                                            $scope.cart.totalNumber = 0;
                                            $scope.cart.totalPrice = 0;
                                            for(var si in $scope.cart.list){
                                                for (var ci in $scope.cart.list[si]['ci_items'])
                                                    if($scope.cart.list[si]['ci_items'][ci].num !== 0){
                                                        $scope.cart.totalNumber +=1;
                                                        $scope.cart.totalPrice += Math.ceil(($scope.cart.list[si]['ci_items'][ci].unit_price * 100) * $scope.cart.list[si]['ci_items'][ci].num )
                                                    }

                                            }
                                            $rootScope.cartCount = $scope.cart.totalNumber;
                                            $scope.cart.totalPrice = $scope.cart.totalPrice / 100;
                                            $state.go('confirmOrder'); 
                                    }
                                    //如果删除后，购物车位空，提示不能下单，并且清空购物车
                                    if(data.ret==1&&data.data==0){
                                                $ionicPopup.alert({
                                                    title  : '删除商品后，购物车为空，不能下单！',
                                                    okText : '确定'
                                                });
                                                $scope.cart = {
                                                    "list": {},
                                                    "totalNumber": 0,
                                                    "totalPrice": 0
                                                }
                                                $scope.obj.empty = true;
                                                $rootScope.cartCount = 0;
                                                $scope.obj.noItem = true;
                                     }
                                     
                                });
                        }else{
                            return;
                        }
                    });
                }

            });
		//$state.go('confirmOrder');


		//$rootScope.addtoShopcart(true);
	}
	//同步价格和数量
	$scope.syncPriceAndNumber = function (){
		$scope.cart.totalNumber = 0;
		$scope.cart.totalPrice = 0;
		for(var si in $scope.cart.list){
			for (var ci in $scope.cart.list[si]['ci_items'])
			if($scope.cart.list[si]['ci_items'][ci].num !== 0){
				$scope.cart.totalNumber +=1;
				//$scope.cart.totalPrice += Math.ceil(($scope.cart.list[si]['ci_items'][ci].unit_price * 100) * $scope.cart.list[si]['ci_items'][ci].num )
                $scope.cart.totalPrice += Math.ceil(($scope.cart.list[si]['ci_items'][ci].real_price * 100) * $scope.cart.list[si]['ci_items'][ci].num );
			}

		}
		$rootScope.cartCount = $scope.cart.totalNumber;
		$scope.cart.totalPrice = $scope.cart.totalPrice / 100;
	}
}])
// .controller('ConfirmOrderController', ['$scope', 'GlobalService', '$rootScope', 'Order', '$ionicLoading', '$ionicPopup','$state', function ($scope, GlobalService, $rootScope, Order, $ionicLoading, $ionicPopup, $state){
// 	$.when( GlobalService.checkUserStatus() )
// 		.done( function(){
// 			//注册用户
// 			if($rootScope.userId){
// 				GlobalService.getShopcartRegister()
// 					.success( function (data){

// 						if(data.ret){
// 							$scope.cart = {
// 								"list"        : data.data.items,
// 								"totalNumber" : 0,
// 								"totalPrice"  : data.data.total_price
// 							}
// 							console.log($scope.cart);
// 							for(var si in $scope.cart.list){
// 								for (var ci in $scope.cart.list[si]['ci_items']){
// 									$scope.cart.totalNumber += 1;
// 									$scope.cart.list[si]['ci_items'][ci].num = parseInt($scope.cart.list[si]['ci_items'][ci].num, 10)
// 								}
// 							}
// 						}
// 					} )
// 			}
// 			else{
// 				//匿名状态，弹出alert
// 				$ionicLoading.hide();
// 				$ionicPopup.alert({
// 					title  : '您必须登录或者注册',
// 					okText : '确定'
// 				})
// 				$state.go('login')
// 			}
// 		} )



// }])

