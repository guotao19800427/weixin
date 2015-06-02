yunShan

.controller('DashController', [ '$scope', 'Dash', '$ionicLoading',  '$ionicPopup', 'GlobalService', '$ionicScrollDelegate', '$ionicActionSheet', '$ionicModal', 'GlobalService', '$rootScope', 'PicURL', '$state', 'BasketSystem', '$q', '$timeout', function ($scope, Dash, $ionicLoading, $ionicPopup, GlobalService, $ionicScrollDelegate, $ionicActionSheet, $ionicModal, GlobalService, $rootScope, PicURL, $state, BasketSystem, $q, $timeout){

	$scope.picURL = PicURL;


	$scope.changeMainActive = function (index){

		$rootScope.menuIndex.subMenuIndex  = 1;
		$rootScope.menuIndex.mainMenuIndex = index + 1;

	}
	$scope.changeSubActive = function (index){
		$rootScope.menuIndex.subMenuIndex = index;
	}
	// 获取产品列表
	$scope.getList = function(id){
		$ionicLoading.show();
		var promiseList = function(){

			var deferred = $q.defer(),
				list;

			if($rootScope.allList && $rootScope.allList[id]){
				list = $rootScope.allList[id];
				deferred.resolve(list);
				
			}
			else{
				
				Dash.getList({
					"id" : id
				})
					.success(function (data){
						
						list = data.data;
						deferred.resolve(list);

					})
			}

			return deferred.promise;

		}

		promiseList()
			.then(function (data){
				
				$timeout(function(){
					$scope.numberDisplayed = 10;
					$scope.listLength = 0;
					$rootScope.menuIndex.subMenuId = id;
                    if(typeof (data) != 'undefined') {
                        for (var i = 0; i < data.length; i++) {
                            $scope.listLength += 1;
                            for (var j = 0; j < data[i].cis.length; j++) {
                                data[i].cis[j].amount = BasketSystem.basket[data[i].cis[j].id] ? BasketSystem.basket[data[i].cis[j].id].amount : 0;
                            }
                        }
                    }
					$scope.list = data;
					$ionicScrollDelegate.$getByHandle('mainScroll').resize();
					$ionicScrollDelegate.$getByHandle('mainScroll').scrollTop(true);
					$scope.$emit('initail.complete');
					$ionicLoading.hide();
				},10)

			})
		
		
		
	}
	// 默认以id为1进行获取
	$scope.getList($rootScope.menuIndex.subMenuId);

	//延迟加载
	$scope.loadMoreItems = function(){
		$scope.numberDisplayed += 10;
		$ionicScrollDelegate.resize();
	}

        

	// 改变收藏状态
	$scope.changeFav = function (ci_ids, is_favorite, si_id){
		$ionicLoading.show();
		GlobalService.changeFav({
			"ci_ids"      : ci_ids,
			"is_favorite" : is_favorite
		})
			.success(function (data){
				$ionicLoading.hide();
				if(data.ret === 1){
					for(var ci in $scope.list){
						if($scope.list[ci].id === si_id){
							$scope.list[ci].is_favorite = is_favorite === 1 ? 2 : 1;
						}
					}
					$ionicPopup.alert({
						title: is_favorite === 1 ? '取消收藏成功' : '收藏成功'
					})
				}
				else{
					$ionicPopup.alert({
						title: data.msg
					})
				}
				
				
			})
	}

	//搜索函数
	$scope.search = function(){
		if(!$scope.searchKey){
			$ionicPopup.alert({
				title  : '请输入关键字进行搜索',
				okText : '确定'
			});
			return;
		}
		$rootScope.searchKey = $scope.searchKey;
		$state.go('search');
	}
    $scope.hiddenDiv = function(){
        $(".mask").hide();
    }
}])