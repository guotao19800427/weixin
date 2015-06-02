yunShan

.config(function($stateProvider, $urlRouterProvider){

	$urlRouterProvider.otherwise("/dash")

	$stateProvider
		.state('dash',{
			url         : '/dash',
			views : {
				"viewA" : {
					templateUrl : 'www/components/dash/dash.html',
					controller  : 'DashController'
				},
				"viewB" : {
					templateUrl : 'www/components/tabs/tabs-has-price.html'
				}
			}
			
		})
		.state('search',{
			url         : '/search',
			views : {
				"viewA" : {
					templateUrl : '/www/components/search/search.html',
					controller  : 'SearchController'
				},
				"viewB" : {
					templateUrl : 'www/components/tabs/tabs-has-price.html'
				}

			}    
		})
		.state('fav',{
			url        : '/fav/list/{pageNumber}',
			views : {
				"viewA" : {
					templateUrl : '/www/components/fav/fav.html',
					controller  : 'FavController'
				},
				"viewB" : {
					templateUrl : '/www/components/tabs/tabs-has-price.html'
				}
			}
		})
		.state('account', {
			url     : '/account',
			views : {
				"viewA" : {
					templateUrl : '/www/components/account/account.html',
					controller  : 'AccountController'
				},
				"viewB" : {
					templateUrl : '/www/components/tabs/tabs.html'
				}
			}
		})
		.state('password',{
			url    : '/account/password',
			views : {
				"viewA" : {
					templateUrl : '/www/components/account/password.html',
					controller  : 'ChangePasswordController'
				}
			}
		})
		.state('address', {
			url    : '/account/address',
			views  : {
				"viewA" : {
					templateUrl : '/www/components/account/address.html',
					controller  : 'ChangeAddressController'
				}
			}
		})
		.state('userInfo', {
			url   : '/account/edit',
			views : {
				"viewA" : {
					templateUrl : '/www/components/account/userInfo.html',
					controller  : 'EditUserInfoController'
				}
			}
		})
		.state('login', {
			url   : '/account/login',
			views : {
				"viewA" : {
					templateUrl : '/www/components/account/login.html',
					controller  : 'UserLoginController'
				}
			}
		})
		.state('register', {
			url   : '/account/register',
			views : {
				"viewA" : {
					templateUrl : '/www/components/account/register.html',
					controller  : 'UserRegisterController'
				}
			}
		})
		
		.state('shopcart', {
			url : '/shopcart',
			views : {
				"viewA" : {
					templateUrl : '/www/components/shopcart/shopcart.html',
					controller  : 'ShopcartController'
				},
				"viewB" : {
					templateUrl : 'www/components/tabs/tabs.html'
				}
			}
		})
		.state('confirmOrder', {
			url : '/shopcart/confirmOrder',
			views : {
				"viewA" : {
					templateUrl : '/www/components/shopcart/confirmOrder.html',
					controller  : 'ShopcartController'
				}
			}
		})
		.state('order', {
			url   : '/order',
			views : {
				"viewA" : {
					templateUrl : '/www/components/order/order.html',
					controller  : 'OrderController'
				},
				"viewB" : {
					templateUrl : 'www/components/tabs/tabs.html'
				}
			}
		})
		.state('orderSuccess', {
			url : '/order/orderSuccess',
			views : {
				"viewA" : {
					templateUrl : '/www/components/order/orderSuccess.html',
					controller  : 'confirmCreateOrderController'
				},
				"viewB" : {
					templateUrl : 'www/components/tabs/tabs.html'
				}
			}
		})
		.state('orderDetail', {
			url : '/order/detail/{orderId}',
			views : {
				"viewA" : {
					templateUrl : '/www/components/order/detail.html',
					controller  : 'OrderDetailController'
				},
				"viewB" : {
					templateUrl : 'www/components/tabs/tabs.html'
				}
			}
		})
		.state('orderList', {
			url : '/order/list/{pageNumber}',
			views : {
				"viewA" : {
					templateUrl : '/www/components/order/order.html',
					controller  : 'OrderController'
				},
				"viewB" : {
					templateUrl : 'www/components/tabs/tabs.html'
				}
			}
		})
		.state('receiver',{
			url : '/account/receiver',
			views :{
				"viewA" : {
					templateUrl : '/www/components/account/receiver.html',
					controller  : 'ReceiverController'
				}
			}
		})
		.state('test', {
			url : '/test',
			views : {
				"viewA" : {
					templateUrl : '/www/components/test/test.html',
					controller  : 'TestController'
				}
			}
		})
})

// 城市
.constant('City', function(){
  var City = {};
  City.cityMapping = [
      {cityID: 1, cityName: '北京'},
      {cityID: 2, cityName: '上海'},
      {cityID: 3, cityName: '成都'},
      {cityID: 4, cityName: '天津'},
      {cityID: 5, cityName: '广州'},
      {cityID: 6, cityName: '重庆'},
      {cityID: 7, cityName: '长沙'},
      {cityID: 8, cityName: '杭州'},
      {cityID: 9, cityName: '武汉'},
      {cityID: 10, cityName: '深圳'},
      {cityID: 11, cityName: '沈阳'}
  ];
  return City;
})

// 最早和最晚时间
.constant('Timing', function(){
	var Timing = {};
	Timing.earlyMapping = [
	    {earlyTimeID: 1, earlyTimeValue: '7:00'},
	    {earlyTimeID: 2, earlyTimeValue: '7:30'},
	    {earlyTimeID: 3, earlyTimeValue: '8:00'},
	    {earlyTimeID: 4, earlyTimeValue: '8:30'},
	    {earlyTimeID: 5, earlyTimeValue: '9:00'},
	    {earlyTimeID: 6, earlyTimeValue: '9:30'},
	    {earlyTimeID: 7, earlyTimeValue: '10:00'},
	    {earlyTimeID: 8, earlyTimeValue: '10:30'}
	  ];
	Timing.lateMapping = [
	    {lateTimeID: 2, lateTimeValue: '7:30'},
	    {lateTimeID: 3, lateTimeValue: '8:00'},
	    {lateTimeID: 4, lateTimeValue: '8:30'},
	    {lateTimeID: 5, lateTimeValue: '9:00'},
	    {lateTimeID: 6, lateTimeValue: '9:30'},
	    {lateTimeID: 7, lateTimeValue: '10:00'},
	    {lateTimeID: 8, lateTimeValue: '10:30'},
	    {lateTimeID: 9, lateTimeValue: '11:00'}
	  ];
	return Timing;
})

// 订单状态对应词条
.constant('OrderStatus', function(){
	var OrderStatus = {
	  "0" : {"info": "已取消"},
      "1" : {"info": "待确认"},
      "2" : {"info": "商家已确认"},
      "3" : {"info": "后台确认"},
      "10": {"info": "待采购中"},
      "11": {"info": "采购中"},
      "12": {"info": "已采购"},
      "20": {"info": "待分拣"},
      "21": {"info": "分拣中"},
      "22": {"info": "已分拣"},
      "30": {"info": "待配送"},
      "31": {"info": "配送中"},
      "32": {"info": "已送达"},
      "40": {"info": "待支付"},
      "41": {"info": "已支付"},
      "50": {"info": "完成"}
	};

	return OrderStatus;

})
//设置全局$http 请求的header 和默认的数据传输格式
.config(function($httpProvider){
	
	$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
	$httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
	$httpProvider.defaults.transformRequest = function(data){
        if (data === undefined) {
            return data;
        }
        return $.param(data);
    }
})
//设置全局的加载遮罩
.constant('$ionicLoadingConfig',{
  template : '<i class="ion-loading-c light"></i>'
})

//设置全局的图片路径的baseURL
.constant('PicURL', {
		'prefix': 'http://img.yunshanmeicai.com/',
		'suffix': '_thumb.png'
	}
)


