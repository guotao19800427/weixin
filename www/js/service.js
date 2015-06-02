
yunShan

.factory('GlobalAPIError',[ '$ionicPopup', '$ionicLoading', function($ionicPopup, $ionicLoading){
	var GlobalAPIError = {};

	GlobalAPIError.showError = function(){
		$ionicLoading.hide();
		$ionicPopup.alert({
			title  :  '抱歉，操作失败，请再次尝试',
			okText : '确定'
		})
	}

	return GlobalAPIError;

}])
// global service
.factory('GlobalService', ['$http', '$ionicLoading', '$ionicPopup', '$rootScope', '$ionicLoading', '$state', 'GlobalAPIError', 'BasketSystem', function ($http, $ionicLoading, $ionicPopup, $rootScope,  $ionicLoading, $state, GlobalAPIError, BasketSystem){
	//多个scope共享的功能放在这里，达到组件共享的目的！

	var GlobalService = {};

	GlobalService.getMenu = function(){
		return $http({
			method : 'GET',
			url    : '/category/category'
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}
	//改变收藏状态
	GlobalService.changeFav = function(options){
		
		return $http({
			method : 'GET',
			url    : '/Commodity/Favorite',
			params   : {
				"ci_ids"      : options.ci_ids,
				"is_favorite" : options.is_favorite
			}
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
			// .success(function (data){
			// 	$ionicLoading.hide();
			// 	if(data.success){
			// 		$ionicPopup.alert({
			// 			title: data.info,
			// 			okText : '确定'
			// 		})
			// 	}
			// })
	}
	//检测用户状态 
	GlobalService.checkUserStatus = function(){
		var dfd = $.Deferred();
		$http({
			method : 'GET',
			url    : '/Account/CheckUserStatus'
		}).success(function (data){	
			
			$rootScope.userStatus   = data.data;
			
			

			
			dfd.resolve();
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
		return dfd.promise();
	}

	//公共的检测状态函数
	GlobalService.dealStatus = function(status){
		
		//没有门店
		if(status !== 1 ){
		  //直接跳转去登录页面
          $ionicLoading.hide();
          $ionicPopup.alert({
            "title" : $rootScope.userStatus.message
          })

          $state.go('login');
		}
		//非正常门店
		// else{
		//   $ionicLoading.hide();
  //         $ionicPopup.alert({
  //           "title" : $rootScope.userStatus.message
  //         })
          
		// }
	}

	//公共的购物流程
	//点击 + — 号
	GlobalService.plus = function(commdityId, commdityPrice){
		if($rootScope.cart[commdityId]){
			$rootScope.cart[commdityId].amount += 1;
		}
		else{
			$rootScope.cart[commdityId] = {
				"id"     : commdityId,
				"amount" : 1,
				"price"  : parseFloat(commdityPrice)
			}
			
		}
		
	}

	GlobalService.minus = function(commdityId){
		if($rootScope.cart[commdityId]){
			if($rootScope.cart[commdityId].amount > 1){
				$rootScope.cart[commdityId].amount -= 1;
			}
			else{
				delete $rootScope.cart[commdityId];
			}
		}
		
	}

	//同步$rootScope.cart 到 scope.list 数据 （这里的case是用户点击 + - 号）
	GlobalService.syncList = function(commdityId, scopeList){
		if(scopeList  && $rootScope.cart[commdityId]){
			for(var i=0; i<scopeList.length; i++){
				for(var j=0; j<scopeList[i].cis.length; j++){
					if(scopeList[i].cis[j].id === commdityId){
						scopeList[i].cis[j].amount = $rootScope.cart[commdityId].amount;

					}		
				}
			}
		}
		else{
			for(var i=0; i<scopeList.length; i++){
				for(var j=0; j<scopeList[i].cis.length; j++){
					if(scopeList[i].cis[j].id === commdityId){
						scopeList[i].cis[j].amount = 0;
					}
					
				}
			}
		}
	}

	//同步 scope.list 数据 到 $rootScope.cart（这里的case是用户在输入框中改变产品数量）
	GlobalService.syncCart = function(commdityId, commdityAmount, commdityPrice){
		if(commdityAmount !== null){
			if($rootScope.cart[commdityId]){
				if(commdityAmount === 0){
					delete $rootScope.cart[commdityId];
				}
				else{
					$rootScope.cart[commdityId].amount = commdityAmount;
					$rootScope.cart[commdityId].price = commdityPrice;
				}
				
			}
			else{
				if(commdityAmount !== 0){
					$rootScope.cart[commdityId] = {
						"id"     : commdityId,
						"amount" : commdityAmount,
						"price"  : commdityPrice
					}
				}
				
			}
		}
		
	}

	// 重新计算 $rootScope 价格数据 和 品类数
	GlobalService.reCaculateCart = function(){
		$rootScope.cartInfo = {
          "price" : 0,
          "itemNumber" : 0
        }
		for(var item in $rootScope.cart){
			if($rootScope.cart[item].hasOwnProperty){
				$rootScope.cartInfo.itemNumber += 1;			
				$rootScope.cartInfo.price += Math.round( ($rootScope.cart[item].price * 100) * $rootScope.cart[item].amount);

			}
		}
		$rootScope.cartInfo.price = $rootScope.cartInfo.price / 100;
	}


	 //公共的加入购物车前执行商品验证
    GlobalService.getVerificationBeforAddToCart = function (){
        return $http({
            method : 'GET',
            url    : '/Cart/VerificationAddToCart',
            params : {
    				"cart"   : BasketSystem.basket
    			}
        })
        .error(function(error){
                GlobalAPIError.showError();
            })
    }
    
	// 公共加入购物车的函数
    //ignore是否忽略不满足购买条件的商品继续添加购物车 yinkw
	GlobalService.addtoShopcartRegister = function (ignore){
		
		return $http({
			method : "GET",//"POST",
			url    : "/Cart/AddToCart",
			params : {
				"cart"   : BasketSystem.basket,
				"ignore" : ignore
			}
		})
		.success(function(data){
			if(data.ret==-1){
                        $ionicPopup.alert({
                            title  :  data.msg,
                            okText : '确定'
                        })
            }
		})
       .error(function(error){
                    GlobalAPIError.showError();
                })
	}
	
	GlobalService.addtoShopcartAnonymous = function(){
		return $http({
			method : "GET",//"POST",
			url    : "/www/fakeJSON/fake-anonymous-add-to-shopcart.json",
			params : {
				"cart"   : $rootScope.cart 
			}
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}

	//公共的读取购物车函数
	GlobalService.getShopcartRegister = function (){
		return $http({
			method : 'GET',
			url    : '/Cart/Cartlist'
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}

	//公共的读取购物车数量的函数(只在初始化时进行一次)
	GlobalService.getCartCount = function (){
		return $http({
			method : 'GET',
			url    : '/Cart/GetCartCount'
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}

	//请求全部产品列表
	GlobalService.getAllList = function (){
		return $http({
			method : 'GET',
			url    : '/commodity/allcommodity'
		})
	}


    //公共的校验购物车中的商品是否在有效时间内
    GlobalService.getVerificationShopcart = function (){
        return $http({
            method : 'GET',
            url    : '/Cart/VerificationCartlist'
        })
            .error(function(error){
                GlobalAPIError.showError();
            })
    }
	return GlobalService;
}])

//dash
.factory('Dash', ['$http', 'GlobalAPIError', function ($http, GlobalAPIError){
	var Dash = {};
	//获取列表
	Dash.getList = function (options){
		return $http({
			method : 'POST',
			url    : '/Commodity/Commodity',
			params : {
				"class2_id" : options.id
			}
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}
	
	return Dash;
}])

//search
.factory('Search', ['$http', 'GlobalAPIError', function ($http, GlobalAPIError){
	var Search = {};

	Search.goSearch = function (options){
		return $http({
			method : 'GET',
			url    : '/Commodity/SearchCommodity',
			params : {
				"name" : options.name
			}
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}

	return Search;
}])

// fav
.factory('Fav', ['$http', '$rootScope', 'GlobalAPIError', function ($http, $rootScope, GlobalAPIError){
	var Fav = {};

	Fav.getFav = function (options){
		return $http({
			method : 'GET',
			url    : '/Commodity/FavCommodity',
			params : {
				"page"    : options.pageNumber,
				"page_size" : 10
			}
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}

	return Fav;
}])

// account
.factory('Account', ['$http', '$state', '$ionicPopup', '$ionicLoading', 'GlobalAPIError', function ($http, $state, $ionicPopup, $ionicLoading, GlobalAPIError){
	var Account = {};

	Account.changeCompanyPassword = function (options){
		return $http({
			method : 'POST',
			url    : '/Account/ChangeCompanyPassword',
			data : {
				"oldPassword"  : options.oldPassword,
				"newPassword"  : options.newPassword
			}
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}

	Account.changeAddress = function (options){
		return $http({
			method : 'GET',
			url    : '/www/fakeJSON/fake-change-fav.json',
			params : {
				"newAddress"  : options.newAddress,
				"userId"      : options.userId
			}
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}

	Account.changeUserInfo = function (options){
		return $http({
			method : 'GET',
			url    : '/www/fakeJSON/fake-change-fav.json',
			params : {
				"newassword" : options.newUserInfo,
				"oldPassword" : options.oldPassword
			}
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}

	Account.login = function (options){
		
		// return $.ajax({
		// 	type : 'POST',
		// 	data : {
		// 		"phone" : options.phone,
		// 		"password": options.password
		// 	},
		// 	dataType : 'json',
		// 	url : '/Account/login',
		// 	success: function(data){
		// 		$ionicLoading.hide();
		// 		console.log(data);
		// 		if(data.ret === 1){
		// 			$state.go('account');
		// 			$ionicPopup.alert({
		// 				title:  data.data
		// 			})
		// 		}
		// 		else{
		// 			$ionicPopup.alert({
		// 				title:  data.msg
		// 			})
		// 		}
		// 	}
		// })
		
		return $http({
			method : 'POST', 
			url    : 'login/weblogin',///account/login
			data   : {
				"phone" : options.phone,
				"password": options.password
			}
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}

	Account.register = function (options){
		return $http({
			method : 'POST', 
			url    : '/Account/Register',
			data : {
				phone       : options.phone,	
				password    : options.password,
				authCode    : options.authCode
  			}
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}
	Account.getCityIds = function (){
		return $http({
			method  : 'GET',
			url     : '/Account/CityList'
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}
	Account.logout = function (options){
		return $http({
			method : 'post',
			url    : '/account/weblogout'
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}

	//获取收货人列表
	Account.getReceivers = function (){
		return $http({
			method : 'GET',
			url    : '/www/fakeJSON/fake-receiver-list.json'
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}

	//设置默认收货人
	Account.setDefaultReceiver = function(options){
		return $http({
			method : 'get',
			url    : '/www/fakeJSON/fake-receiver-list.json',
			data   : {
				'id' : options.id
			}
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}

	return Account; 
}])

// order
.factory('Order', ['$http', 'GlobalAPIError', function ($http, GlobalAPIError){
	var Order = {};

	Order.getList = function(options){
		return $http({
			method : 'GET',
			url    : '/order/orders',
			params : {
				"page"      : options.pageNumber,
				"page_size" : 15
			}
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}

	Order.getDetail = function (options){
		return $http({
			method : 'GET',
			url    : '/Order/OrderItem',
			params : {
				'custom_order_id' : options.orderId
			}
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}

	Order.getSingleDetail = function (options){
		return $http({
			method : 'GET',
			url    : '/Order/CreateOrder',
			params : {
				"receive_start_time" : options.earlyTime,
				"receive_end_time"   : options.lateTime
			}
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}

	return Order;
}])

// shopcart
.factory('Shopcart', ['$http', 'GlobalAPIError', function ($http, GlobalAPIError){
	var Shopcart = {};

	Shopcart.plusOrMinus = function (options){
		return $http({
			method : 'GET',
			url    : '/Cart/ChangeNum',
			params : {
				"id"     : options.commdityId,
				"amount" : options.commdityNumber
			}
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}

	Shopcart.emptyCart = function (){
		return $http({
			method : 'GET',
			url    : '/Cart/ClearCart'
		})
		.error(function(error){
			GlobalAPIError.showError();
		})
	}

    Shopcart.delCartInfo = function (){
        return $http({
            method : 'GET',
            url    : '/Cart/DelCartInfo'
        })
            .error(function(error){
                GlobalAPIError.showError();
            })
    }
	return Shopcart;
}])

// count system for dash, search and fav
.factory('BasketSystem', ['$rootScope','$ionicScrollDelegate','$ionicPopup',function($rootScope,$ionicScrollDelegate,$ionicPopup){
	var BasketSystem = {};

	BasketSystem.basket = BasketSystem.basket || {}; 
	BasketSystem.statistics = BasketSystem.statistics || {};

	BasketSystem.emptyBasket = function(){
		BasketSystem.basket = {};
	}

	BasketSystem.plus = function (ciID, ciPrice,amount,limit){
            amount = parseInt(amount);
            limit = parseInt(limit);
		if(BasketSystem.basket[ciID]){ 
                    if((amount||limit)||(amount==0||limit==0)){
                        if(amount==0||limit==0){
                                $ionicPopup.alert({
                                           title: '当前商品库存不足，请重新选择数量！',
                                           okText : '确定'
                                })
                        }else{
                            if(BasketSystem.basket[ciID].amount>=amount||BasketSystem.basket[ciID].amount>=limit){
                                if(BasketSystem.basket[ciID].amount>=amount){
                                    $ionicPopup.alert({
                                            title: '当前商品库存不足，请重新选择数量！',
                                            okText : '确定'
                                    })  
                                }
                                if(BasketSystem.basket[ciID].amount>=limit){
                                    $ionicPopup.alert({
                                            title: '当前商品限购'+limit+'个，请重新选择数量！',
                                            okText : '确定'
                                    })  
                                }
                            }else{
                                if((BasketSystem.basket[ciID].amount+1)<=9999){
                                    BasketSystem.basket[ciID].amount += 1;
                                }
                            }
                        }
                    }else{
                               if((BasketSystem.basket[ciID].amount+1)<=9999){
                                    BasketSystem.basket[ciID].amount += 1;
                                }
                    }                 
                }else{ 
                    if((amount||limit)||(amount==0||limit==0)){
                        if(amount==0||limit==0){
                            $ionicPopup.alert({
                                            title: '当前商品库存不足，请重新选择数量！',
                                            okText : '确定'
                            })
                        }else{
                            BasketSystem.basket[ciID] = {
				"id"      : ciID,
				"amount"  : 1,
				"price"   : ciPrice
 			};
                        }
                    }else{
                        BasketSystem.basket[ciID] = {
				"id"      : ciID,
				"amount"  : 1,
				"price"   : ciPrice
 			};
                    }	
		}
	}

	BasketSystem.minus = function (ciID){
		if(BasketSystem.basket[ciID]){
			
			if(BasketSystem.basket[ciID].amount > 1){
				BasketSystem.basket[ciID].amount -= 1;
			}
			else{

				delete BasketSystem.basket[ciID];
			}
		}
	}

	BasketSystem.changeNumner = function (ciID, ciAmount, ciPrice,amount,limit,num,$ionicPopup,scope){
                      amount = parseInt(amount);
                      limit = parseInt(limit);
                      num = parseInt(num);
                      //促销优先级  如果库存不足，则不提示单店限购
                      var tag = true;
                      BasketSystem.basket[ciID] = {
				"id"      : ciID,
				"amount"  : ciAmount,
				"price"   : ciPrice
                      }
                      if((amount||limit)||(amount==0||limit==0)){
                                if(amount==0||limit==0){
                                        $ionicPopup.alert({
                                                   title: '当前商品库存不足，请重新选择数量！',
                                                   okText : '确定'
                                        });
                                        BasketSystem.basket[ciID].amount = num;
                                        if(num==0){
                                            BasketSystem.minus(ciID);
                                            $rootScope.promote=true;
                                        }
                                        $ionicScrollDelegate.resize(); 
                                }else{
                                    if(BasketSystem.basket[ciID].amount>amount||BasketSystem.basket[ciID].amount>limit){
                                        
                                        if(BasketSystem.basket[ciID].amount>=amount){
                                            $ionicPopup.alert({
                                                    title: '当前商品库存不足，请重新选择数量！',
                                                    okText : '确定'
                                            })
                                            tag=false;
                                        }
                                        if(BasketSystem.basket[ciID].amount>=limit&&tag){
                                            $ionicPopup.alert({
                                                    title: '当前商品限购'+limit+'个，请重新选择数量！',
                                                    okText : '确定'
                                            })  
                                        }
                                        BasketSystem.basket[ciID].amount = num;
                                        if(num==0){
                                            BasketSystem.minus(ciID);
                                            $rootScope.promote=true;
                                        }
                                        $ionicScrollDelegate.resize(); 
                                    }else{
                                        BasketSystem.basket[ciID].amount = ciAmount;
                                    }
                                }
                        }else{
                               BasketSystem.basket[ciID].amount = ciAmount;
                        } 
	}

	BasketSystem.syncBasket = function (ciID, scopeList, scope){
		if(scopeList  && BasketSystem.basket[ciID]){	
			for(var i=0; i<scopeList.length; i++){
				for(var j=0; j<scopeList[i].cis.length; j++){
					if(scopeList[i].cis[j].id === ciID){
						scope.$apply(function(){
							scopeList[i].cis[j].amount = BasketSystem.basket[ciID].amount;
						})
					}		
				}
			}
		}
		else{
			for(var i=0; i<scopeList.length; i++){
				for(var j=0; j<scopeList[i].cis.length; j++){
					if(scopeList[i].cis[j].id === ciID){
						scope.$apply(function (){
							scopeList[i].cis[j].amount = 0;
						})
					}
					
				}
			}
		}
	}

	BasketSystem.reCaculateBasket = function (scope){
		scope.$apply(function(){
			$rootScope.cartInfo = {
	          "price" : 0,
	          "itemNumber" : 0
	        }

			for(var item in BasketSystem.basket){
				if(BasketSystem.basket[item].hasOwnProperty){
					$rootScope.cartInfo.itemNumber += 1;			
					$rootScope.cartInfo.price += Math.round( (BasketSystem.basket[item].price * 100) * BasketSystem.basket[item].amount);

				}
			}
			$rootScope.cartInfo.price = $rootScope.cartInfo.price / 100;
		})
		
	}
        BasketSystem.checkSaleTime = function (startSaleTime,endSaleTime){
            
            var reg = /\:/g;
            var sDate = new Date();
            var s = startSaleTime.split(reg);
            sDate.setHours (s[0]);
            sDate.setMinutes (s[1]);

            var eDate = new Date();
            var e = endSaleTime.split(reg);
            eDate.setHours (e[0]);
            eDate.setMinutes (e[1]);

            var now = new Date();
            var h = now.getHours();
            var m = now.getMinutes();
            now.setHours(h, m);
            if((now-sDate)<0||(now-eDate)>0){
                return 0;
            }else{
                return 1;
            }
        }
	return BasketSystem;
}])

// the corresponding directive of count system
.directive('basketPlusButton', ['BasketSystem', '$ionicPopup','$timeout', function (BasketSystem,$ionicPopup,$timeout){
	return{
		restrict : 'A',
		link     : function (scope, element, attrs){
			scope.list = scope.list || scope.searchResult || scope.favList;
			var id = attrs.attrId,
				price = Number(attrs.attrPrice),
                                startSaleTime=attrs.attrStart,
                                endSaleTime=attrs.attrEnd,
                                amount=attrs.attrAmount,
                                limit =attrs.attrLimit;
			element.on('click', function (){
//                            alert('plus');
                    $timeout(function(){
                                var flag = BasketSystem.checkSaleTime(startSaleTime,endSaleTime);
                                if(!flag){
                                     $ionicPopup.alert({
                                            title: '该商品售卖时间为'+startSaleTime+'-'+endSaleTime
                                     })
                                }else{
                                            BasketSystem.plus(id, price,amount,limit,$ionicPopup);
                                            BasketSystem.syncBasket(id, scope.list, scope);
                                            BasketSystem.reCaculateBasket(scope);
                                } 
                            },50)
                        })
		}    
	}
}])

.directive('basketMinusButton', ['BasketSystem','$timeout', function (BasketSystem,$timeout){
	return {
		restrict : 'A',
		link     : function (scope, element, attrs){
			scope.list = scope.list || scope.searchResult || scope.favList;
			var id = attrs.attrId;

			element.on('click', function(){	
                            $timeout(function(){
				BasketSystem.minus(id);
				BasketSystem.syncBasket(id, scope.list, scope);
				BasketSystem.reCaculateBasket(scope);
                            },50)
                                
			})

		}
	}
} ])

.directive('basketAmountInput', ['BasketSystem','$ionicPopup','$rootScope','$ionicScrollDelegate', function(BasketSystem,$ionicPopup,$rootScope,$ionicScrollDelegate){
	return {
		restrict : 'A',
		link     : function (scope, element, attrs){
			scope.list = scope.list || scope.searchResult || scope.favList;
			var id = attrs.attrId,
				price = Number(attrs.attrPrice),
                                startSaleTime=attrs.attrStart,
                                endSaleTime=attrs.attrEnd,
                                amount=attrs.attrAmount,
                                limit =attrs.attrLimit,
                                num = attrs.attrCamount;
			element.on('blur', function(){
//                            alert('blur');
                                var flag = BasketSystem.checkSaleTime(startSaleTime,endSaleTime);
                                if(!flag){
                                    if(element.val()!=0){
                                        $ionicPopup.alert({
                                              title: '该商品售卖时间为'+startSaleTime+'-'+endSaleTime
                                        })
                                    }
                                      element.val(0);
                               }else{
                                    var value = Number(element.val());
                                    if(value < 1 || value === undefined || isNaN(value)){
                                            value = 0;
                                            if(BasketSystem.basket[id]){
                                                    delete BasketSystem.basket[id];
                                                    BasketSystem.reCaculateBasket(scope);
                                            }
                                    }
                                    if(value>9999){
                                        value=9999;
                                        if(BasketSystem.basket[id]){
                                                    delete BasketSystem.basket[id];
                                                    BasketSystem.reCaculateBasket(scope);
                                        }
                                    }
                                    value = parseInt(value, 10);
                                    element.val(value);
                                    if(value>0){
                                            BasketSystem.changeNumner(id, value, price,amount,limit,num,$ionicPopup,scope);
                                            BasketSystem.syncBasket(id, scope.list, scope);
                                            BasketSystem.reCaculateBasket(scope);
                                    }
                                }
                                $ionicScrollDelegate.resize(); 
			})
                        //聚焦清0
                        element.on('focus',function(){
                            var count = element.val();
                            if(count == 0){
                                element.val('');
                            }else{
                                num=count;
                            }
                        })
		}
	}
}])

// 标签切换
.directive('mainMenuSwitchActive', [ '$rootScope', function ($rootScope){
	return{
		restrict : 'A',
		link     : function(scope, element, attrs){
			element
			
			.on('click', function (event){	
				$rootScope.mainMenuActiveIndex = $(this).index();		
				scope.$emit('subMenuActiveIndex.change', $rootScope.subMenuActiveIndex);
				$(this).addClass('active');
				$(this).siblings().removeClass('active');
			})

			if($rootScope.mainMenuActiveIndex !== undefined){
				if(element.index() === $rootScope.mainMenuActiveIndex){
					element.addClass('active');
				}
				
			}
			else if(element.index() == 0){	
				element.addClass('active');	
			}
			
		}
	}
}])
.directive('subMenuSwitchActive', [ '$rootScope', function ($rootScope){
	return{
		restrict : 'A',
		link     : function(scope, element, attrs){
			$rootScope.$on('subMenuActiveIndex.change', function(){
				$rootScope.subMenuActiveIndex = 0;
				if(element.index() == 0){	
					element.addClass('active');	
				}
				else{
					element.removeClass('active');	
				}
			})
			element.on('click', function (event){
				$rootScope.subMenuActiveIndex = $(this).index();
				$(this).addClass('active');
				$(this).siblings().removeClass('active');
			})
			if($rootScope.subMenuActiveIndex !== undefined){
				if(element.index() === $rootScope.subMenuActiveIndex){
					element.addClass('active');
				}
				
			}
			else if(element.index() == 0){	
				element.addClass('active');	
			}
			
		}
	}
}])
