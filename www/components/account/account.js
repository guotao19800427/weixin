yunShan

.controller('AccountController', ['$scope', 'GlobalService', '$ionicLoading', '$rootScope', '$ionicModal', 'Account', '$ionicPopup', '$state', function ($scope, GlobalService, $ionicLoading, $rootScope, $ionicModal, Account, $ionicPopup, $state){
	$ionicLoading.show();
	$.when(GlobalService.checkUserStatus())
		.done(function(){
			$ionicLoading.hide();
		})
	// 不论用户是什么状态，都需要模态框
	//多个模态框
	//服务条款
	$ionicModal.fromTemplateUrl('/www/components/account/rule.html', {
		id                   : 'rule',
		scope                : $scope,
		backdropClickToClose : true,
		animation            : 'slide-in-up'
	}).then(function (modal){
		$scope.ruleModal = modal;
	})
	//售后服务
	$ionicModal.fromTemplateUrl('/www/components/account/service.html', {
		id                   : 'service',
		scope                : $scope,
		backdropClickToClose : true,
		animation            : 'slide-in-up'
	}).then(function (modal){
		$scope.serviceModal = modal;
	})

	// 打开模态框的函数
	$scope.openModal = function (id){
		if( id === 'rule'){
			$scope.ruleModal.show();
		}
		else{
			$scope.serviceModal.show();
		}
	}
	//关闭模态框的函数
	$scope.closeModal = function (id){
		if( id === 'rule'){
			$scope.ruleModal.hide();
		}
		else{
			$scope.serviceModal.hide();
		}
	}
	//$scope 死亡时，销毁模态框
	$scope.$on('$destory', function(){
		$scope.ruleModal.remove();
		$scope.serviceModal.remove();
	})

	//解除门店
	$scope.logout  = function (){
		$ionicLoading.show();
		Account.logout ()
			.success(function (data){
				$ionicLoading.hide();
				if(data.ret === 1){
					$rootScope.cartCount = 0;
					$state.reload();
					$ionicPopup.alert({
						title  : data.data,
						okText : '确定'
					})
					
				}
				else{
					$ionicPopup.alert({
						title  : data.msg,
						okText : '确定'
					})
				}
			})
	}
}])

//修改密码
.controller('ChangePasswordController', ['$scope', '$ionicPopup', 'Account', '$rootScope', '$state', '$ionicLoading', 'GlobalService', function ($scope, $ionicPopup, Account, $rootScope, $state, $ionicLoading, GlobalService){
	$scope.password = {};
	$scope.changePassword = function (){
		if(!$.trim($scope.password.oldPassword)){
			$ionicPopup.alert({
				title  : '请输入您目前的密码',
				okText : '确定'
			});
			return;
		}
		if(!$.trim($scope.password.newPassword)){
			$ionicPopup.alert({
				title  : '请输入您的新密码',
				okText : '确定'
			});
			return;
		}
		if(!$.trim($scope.password.confirmedPassword)){
			$ionicPopup.alert({
				title  : '请确定您要输入的新密码',
				okText : '确定'
			});
			return;
		}
		if($.trim($scope.password.newPassword) !== $.trim($scope.password.confirmedPassword)){
			$ionicPopup.alert({
				title  : '两次输入的密码不符 请确认',
				okText : '确定'
			});
			return;
		}
		$ionicLoading.show();
		// 考虑健壮性 首先检测用户状态
		//延迟对象
		
				
		Account.changeCompanyPassword({
			"oldPassword" : $scope.password.oldPassword,
			"newPassword" : $scope.password.newPassword,
		}).success(function (data){
			
			$ionicLoading.hide();
			if(data.ret === 1){
				$ionicPopup.alert({
					title  : data.data,
					okText : '确定'
				});
				$state.go('account')
			}
			else{
				$ionicPopup.alert({
					title  : data.msg,
					okText : '确定'
				})
			}
			
		})
				
				
			


		
	}
}])

// 修改收货地址
// .controller('ChangeAddressController', ['$scope', '$rootScope', '$ionicLoading', 'GlobalService', '$ionicPopup', 'Account', '$state', function ($scope, $rootScope, $ionicLoading, GlobalService, $ionicPopup, Account, $state){
// 	$ionicLoading.show();
// 	$scope.model= {};
// 	// 考虑健壮性 首先检测用户状态
// 	//延迟对象
// 	$.when(GlobalService.checkUserStatus())
// 		.done(function (){
// 			$ionicLoading.hide();
// 			if($rootScope.userId){
// 				$scope.model.newAddress = $rootScope.userInfo.address;
// 				$scope.changeAddress = function (){
// 					$ionicLoading.show();
// 					Account.changeAddress({
// 						"newAddress" : $scope.model.newAddress,
// 						"userId"     : $rootScope.userId
// 					}).success(function (data){
// 						$ionicLoading.hide();
// 						var confirm = $ionicPopup.confirm({
// 							title      : data.info,
// 							okText     : "返回账户页",
// 							cancelText : "确定"
// 						});
// 						confirm.then(function (res){
// 							if (res){
// 								$state.go('account')
// 							}
// 						})
// 					})
// 				}
// 			}
// 			else{
// 				$ionicPopup.alert({
// 					title : '检测到您处于未登录状态,请先登录'
// 				});
// 				$state.go('account');
// 			}
// 		})
// }])

// //修改用户资料
// .controller('EditUserInfoController', [ '$scope', '$rootScope', 'GlobalService', '$ionicLoading', 'Account', 'City', '$ionicPopup', function ($scope, $rootScope, GlobalService, $ionicLoading, Account, City, $ionicPopup){
// 	$ionicLoading.show();
// 	$scope.cities = City().cityMapping;
	
// 	$scope.model= {};
// 	// 考虑健壮性 首先检测用户状态
// 	//延迟对象
// 	$.when(GlobalService.checkUserStatus())
// 		.done(function(){
// 			$ionicLoading.hide();
// 			if($rootScope.userId){
// 				$scope.model = $rootScope.userInfo;
// 				$scope.$watch('model.city', function (now, pre){
// 					for(var i=0; i<$scope.cities.length; i++){
// 						if($scope.cities[i].cityName === now){
// 							$scope.model.cityID = $scope.cities[i].cityID
// 						}
// 					}
					
// 				})
// 				$scope.editUserInfo = function (){
// 					$ionicLoading.show();
// 					Account.changeUserInfo({
// 						"newUserInfo" : $scope.modal,
// 						"userId"      : $rootScope.userId
// 					}).success(function (data){
// 						$ionicLoading.hide();
// 						if(data.success){
// 							$ionicPopup.alert({
// 								"title" : data.info
// 							})
// 						}
// 					})
// 				}
// 			}
// 		})
// }])

// 用户登录
.controller('UserLoginController', ['$scope', '$ionicPopup', '$ionicLoading', 'Account', '$state', '$rootScope', 'GlobalService', function ($scope, $ionicPopup, $ionicLoading, Account, $state, $rootScope, GlobalService){
	$scope.model = {};
	$scope.login = function (){
		//前端判断
		if(!/^\d{11}$/.test($.trim($scope.model.phone))){
			$ionicPopup.alert({
				'title' : '无效的手机号码'
			});
			return;
		}
		if(!$.trim($scope.model.password)){
			$ionicPopup.alert({
				'title' : '请输入密码'
			});
			return;
		}
		//前端验证无误，开始后端请求

		$ionicLoading.show();

		Account.login({
			phone    : $scope.model.phone,
			password : $scope.model.password
		}).success(function (data){
			$ionicLoading.hide();
			//返回购物车数量
			GlobalService.getCartCount()
	          .success( function (data){
	            if(data.ret === 1){
	              $rootScope.cartCount = data.data.data.total_ci_num;
	              
	            }
	          })
			

			if(data.ret === 1){
				

				$state.go('account');
				$ionicPopup.alert({
					title : data.data
				})
			}
			else{
				
				$ionicPopup.alert({
					title : data.msg
				})
			}
			
			
			
		})

	}
}])

//用户注册
.controller('UserRegisterController', ['$scope', 'City', 'Timing', '$ionicPopup', 'Account', '$ionicLoading', '$state', function ($scope, City, Timing, $ionicPopup, Account, $ionicLoading, $state){
	$scope.model = {};
	$scope.cities = City().cityMapping;
	$scope.timing = Timing();
	$ionicLoading.show();
	$.when(
		Account.getCityIds()
			.success(function(data){
				$ionicLoading.hide();
				
				if(data.ret ===1){
					$scope.cityList = data.data;
				}
				
			})
	)
		.done(function(){
			$scope.register = function (){

				//前端验证
				if(!/^\d{11}$/.test($.trim($scope.model.phone))){
					$ionicPopup.alert({
						'title' : '无效的手机号码'
					});
					return;
				}

				if(!$.trim($scope.model.password)){
					$ionicPopup.alert({
						'title' : '请输入密码'
					});
					return;
				}

				// if(!$.trim($scope.model.companyName)){
				// 	$ionicPopup.alert({
				// 		'title' : '请输入商铺名称'
				// 	});
				// 	return;
				// }

				// if(!$.trim($scope.model.personName)){
				// 	$ionicPopup.alert({
				// 		'title' : '请输入店主姓名'
				// 	});
				// 	return;
				// }

				// if(!$scope.model.city){
				// 	$ionicPopup.alert({
				// 		'title' : '请选择城市'
				// 	});
				// 	return;
				// }

				// if(!$scope.model.earlyTiming){
				// 	$ionicPopup.alert({
				// 		'title' : '请选择最早收货时间'
				// 	});
				// 	return;
				// }

				// if(!$scope.model.lateTiming){
				// 	$ionicPopup.alert({
				// 		'title' : '请选择最晚收货时间'
				// 	});
				// 	return;
				// }

				// if( parseInt($scope.model.earlyTiming.replace(':','')) >= parseInt($scope.model.lateTiming.replace(':','')) ){
				// 	$ionicPopup.alert({
				// 		'title' : '最早收货时间不能等于或晚于最晚收货时间'
				// 	});
				// 	return;
				// }

				if(!$.trim($scope.model.authCode)){
					$ionicPopup.alert({
						'title' : '请输入有效的授权码'
					});
					return;
				}
				// //得到city id
				// for(var item in $scope.cityList){
				// 	if($scope.cityList[item] === $scope.model.city){
				// 		$scope.model.cityId = item;
				// 	}
				// }
				$ionicLoading.show();
				Account.register({
					"phone"       : $scope.model.phone,
					// "companyName" : $scope.model.companyName,
					"password"    : $scope.model.password,
					"authCode"    : $scope.model.authCode
					// "city"        : $scope.model.cityId
				}).success(function (data){
					$ionicLoading.hide();
					
					if(data.ret === 1){
						$state.go('account');
						$ionicPopup.alert({
							title : data.data
						})
					}
					else{
						$ionicPopup.alert({
							title : data.msg
						})
					}
					// if(data.success){
					// 	$state.go('account');
					// }
					// $ionicPopup.alert({
					// 	'title' : data.info
					// });
				})

			}
		})
	
}])
//收货人
.controller('ReceiverController', ['$scope', 'Account', '$ionicLoading', '$ionicPopup', function ($scope, Account, $ionicLoading, $ionicPopup){
	$scope.recieiverList = [];
	// 获取列表
	Account.getReceivers()
		.success(function (data){
			if(data.ret ===1){
				$scope.recieiverList = data.data;
			}
		});
	// 更改默认收货人
	$scope.setDefaultReceiver = function (receiverId, isDefault){
		if(isDefault === '1'){
			return;
		}
		//请求成功后，更新 $scope.recieiverList，相应状态会自动更新
		else{
			$ionicLoading.show();
			Account.setDefaultReceiver({
				'id' : receiverId
			})
				.success(function (data){
					$ionicLoading.hide();
					console.log(data.ret)
					if(data.ret === 1){

						for (var i=0; i<$scope.recieiverList.length; i++){
							
							if($scope.recieiverList[i].id === receiverId){
								
								$scope.recieiverList[i].is_default = '1';

							}
							else{
								$scope.recieiverList[i].is_default = '0';
							}
						}
						
					}
				})
		}
	}
	// 编辑收货人
	$scope.editReceiver = function (receiverName, receiverPhone, receiverId){
		$scope.obj = {
			'id'   : receiverId,
			'name' : receiverName,
			'phone': receiverPhone
		}
		var popup = $ionicPopup.confirm({
			title    : '编辑收货人',
			template : '<div class="list"><label class="item item-input"><span class="input-label">收货人姓名</span><input type="text" ng-model="obj.name" placeholder="请输入收货人姓名" autofocus></label><label class="item item-input"><span class="input-label">收货人电话</span><input type="tel" ng-model="obj.phone" placeholder="请输入收货人电话"></label></div>',
			okText    : '确定',
			cancelText : '取消',
			scope : $scope
		})
		//请求api, 成功后用更新的收货人信息替换原有的对应的收货人, 收货人列表会自主更新
		popup.then(function(res){
			if(res){
				alert('you are sure');
			}
			else{
				alert('you canceled it.');
			}
		})
	}

	// 增加收货人
	$scope.addReceiver = function(){
		$scope.newReceiver = {
			'name'  : '',
			'phone' : ''
		}
		var popup = $ionicPopup.confirm({
			title    : '增加收货人',
			template : '<div class="list"><label class="item item-input"><span class="input-label">收货人姓名</span><input type="text" ng-model="newReceiver.name" placeholder="请输入收货人姓名" autofocus></label><label class="item item-input"><span class="input-label">收货人电话</span><input type="tel" ng-model="newReceiver.phone" placeholder="请输入收货人电话"></label></div>',
			okText    : '确定',
			cancelText : '取消',
			scope : $scope
		})
		//请求api, 成功后用将新的收货人信息增加到原有的收货人列表, 收货人列表会自主更新
		popup.then(function(res){
			if(res){
				alert('you add a new receiver');
			}
			else{
				alert('you canceled it');
			}
		})
	}

	// 删除收货人
	$scope.removeReceiver = function (receiverId){
		var popup = $ionicPopup.confirm({
			title    : '删除收货人',
			template : '确定删除此收货人吗？',
			okText    : '确定',
			cancelText : '取消'
		})
		//请求api, 成功后将原收货人列表的对应id所属对象删除(Array.splice),收货人列表会自主更新
		popup.then(function(res){
			if(res){
				alert('you removed a new receiver');
			}
			else{
				alert('you canceled it');
			}
		})
	}
}])


