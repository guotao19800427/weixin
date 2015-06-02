// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var yunShan = angular.module('yunShan', ['ionic']);
yunShan

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

//在rootScope记录一级和2级列表,注入相应的global service, 缓存当前的一级menu的id和二级menu的id
.run(['$rootScope', 'GlobalService', '$ionicLoading', '$ionicScrollDelegate', function ($rootScope, GlobalService, $ionicLoading, $ionicScrollDelegate){
  $ionicLoading.show();
  $rootScope.menuIndex = {
    "mainMenuIndex" :  1,
    "subMenuIndex"  :  1,
    "subMenuId"     : 1
  }
  $rootScope.getSubMenu = function (index){
      //alert($rootScope.menu.class1[index-1].id);
    $rootScope.subMenu = $rootScope.menu.class2[$rootScope.menu.class1[index-1].id];
    $ionicScrollDelegate.$getByHandle('subScroll').resize();
    $ionicScrollDelegate.$getByHandle('subScroll').scrollTop();
  }
  GlobalService.getMenu()
    .success(function (data){
      $ionicLoading.hide();
      $rootScope.menu = data.data;
      $rootScope.getSubMenu($rootScope.menuIndex.subMenuIndex);
    })
}])

//检测用户状态 获取usesId 和 userInfo
.run(['$rootScope', 'GlobalService', function($rootScope, GlobalService){
  $.when(GlobalService.checkUserStatus())
    .done(function (){

      //初始化的时候如果是登录用户，会有一次性的请求购物车数量
      //并赋值给全局变量 $rootScope.cartCount
      //以后每次点击 “加入购物车” 时，会根据请求返回的数据更新$rootScope.cartCount
      
      if($rootScope.userStatus.status === 1){
        GlobalService.getCartCount()
          .success( function (data){
            if(data.ret === 1){
              $rootScope.cartCount = data.data.data.total_ci_num;
              
            }
          })
      }
      
    })
    
}])

// 设置"菜篮子"
.run(['$rootScope', 'GlobalService', function($rootScope, GlobalService){
 
  $rootScope.initialCart = function(){
    $rootScope.cartInfo = {
      "price" : 0,
      "itemNumber" : 0
    }
  }
  
 $rootScope.initialCart();
}])
//限购标识
.run(['$rootScope',function($rootScope){
  $rootScope.promote=false;
}])
// 加入购物车的全局函数
.run(['$rootScope', 'GlobalService', '$ionicLoading', '$state', '$ionicPopup', 'BasketSystem','$timeout',function ($rootScope, GlobalService, $ionicLoading, $state, $ionicPopup, BasketSystem,$timeout){
  $rootScope.addtoShopcart = function(order){
      $timeout(function(){
          if(!$rootScope.promote){
            if($.isEmptyObject(BasketSystem.basket)){
              $ionicPopup.alert({
                'title'  : '您还没有选择菜品',
                'okText' : '确定'
              });
              return;
            }
            $ionicLoading.show();
            $.when(GlobalService.checkUserStatus())
              .done(function (){
              	
                //正常门店
                if($rootScope.userStatus.status === 1){
                   
                	GlobalService.getVerificationBeforAddToCart()
                    .success(
                    
                    function (data){

                      $ionicLoading.hide();
                      if(data.ret === 1 && data.data.flag==0){
                      	
	                       var popup = $ionicPopup.confirm({
		                        title     : '提示',
		                        //modify by yinkw 2015-05-18 加入购物车增加校验逻辑，并改变提示方式
		                        template  : '以下商品无法加入购物车:<br/>'+data.data.msg+"<br/>是否忽略以上商品继续添加？",
		                        //modify end
		                        okText    : '忽略并继续添加',
		                        cancelText : '返回',
		                        scope : $rootScope
	                        });
	                        popup.then(function(res){
		                         if(res){
		                            //忽略不满足条件的商品
		                            GlobalService.addtoShopcartRegister(true)
						                    .success(function (data){
						
						                      $ionicLoading.hide();
						                      if(data.ret === 1){
						                        //给购物车数量 $rootScope.cartCount重新赋值
						                        $rootScope.cartCount = parseInt(data.data.total_ci_num,10)
						                        //清空$rootScope.cart和$rootScope.cartInfo
						                        $rootScope.initialCart();
						                        BasketSystem.emptyBasket();
						
						                        if(!order){
						                          $state.go('shopcart');
						                        }
						                        else{
						                          $state.go('confirmOrder');
						                        }
						                        
						                      }else if(data.ret === 2){
						                      	 $ionicPopup.alert({
						                         'title'  : data.msg,
						                         'okText' : '确定'
						                       });
						                  return;
						                      }
						             })
		                         }
	                         });
                        }else if(data.ret === 1 && data.data.flag==1){
                        	//忽略不满足条件的商品
		                            GlobalService.addtoShopcartRegister(false)
						                    .success(function (data){
						
						                      $ionicLoading.hide();
						                      if(data.ret === 1){
						                        //给购物车数量 $rootScope.cartCount重新赋值
						                        $rootScope.cartCount = parseInt(data.data.total_ci_num,10)
						                        //清空$rootScope.cart和$rootScope.cartInfo
						                        $rootScope.initialCart();
						                        BasketSystem.emptyBasket();
						
						                        if(!order){
						                          $state.go('shopcart');
						                        }
						                        else{
						                          $state.go('confirmOrder');
						                        }
						                        
						                      }else if(data.ret === 2){
						                      	 $ionicPopup.alert({
						                         'title'  : data.msg,
						                         'okText' : '确定'
						                       });
						                  return;
						                      }
						             })
                        }
                      }
                    )
                  return;
                }
                GlobalService.dealStatus($rootScope.userStatus.status);  
              })
              }
       }, 30)
       $rootScope.promote=false;  
  }
}])

//侦测路由并确定激活的tab
.run(['$rootScope',function($rootScope) { 
  $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
    var path = toState.name;
    if(/dash/.test(path)){
      $rootScope.activeTabIndex = 0;
    }
    else if(/shopcart/.test(path)){
       $rootScope.activeTabIndex = 1;
    }
    else if(/order/.test(path)){
       $rootScope.activeTabIndex = 2;
    }
    else if(/fav/.test(path)){
       $rootScope.activeTabIndex = 3;
    }
    else if(/account/.test(path)){
       $rootScope.activeTabIndex = 4;
    }
    else{
      $rootScope.activeTabIndex = false;
    }
  })
}])

//监听dashboard第一次初始化完成后，开始在1000毫秒后向服务器请求整个产品列表
.run(['$rootScope', '$timeout', 'GlobalService', function($rootScope, $timeout, GlobalService) {
  var first = true;
  $rootScope.$on('initail.complete', function(){
    if(first){
      first = false;
      var getAllList = function(){
        GlobalService.getAllList()
        .success(function (data){
          if(data.ret === 1){
            $rootScope.allList = data.data;
          }
        })
      }
      $timeout(getAllList, 1000)
      
      
      
    }
  })
}])




