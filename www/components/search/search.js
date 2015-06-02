yunShan

.controller('SearchController',['$scope', '$ionicLoading', 'Search', '$ionicPopup', 'GlobalService', '$rootScope', 'PicURL', '$ionicScrollDelegate', 'BasketSystem', function ($scope, $ionicLoading, Search, $ionicPopup, GlobalService, $rootScope, PicURL, $ionicScrollDelegate, BasketSystem){
	$scope.picURL = PicURL;
	$scope.searchKey = '';
	$scope.goSearch = function(){
		$scope.searchResult= {}
		$ionicLoading.show();
		Search.goSearch({
			"name" : $scope.searchKey
		}).success(function (data){
			$scope.numberDisplayed = 10;
			$scope.listLength = 0;
			$ionicLoading.hide();
			if($.isEmptyObject(data.data)){
				$scope.noResult = true;
			}
			else{
				$scope.noResult = false;
				for(var i=0; i<data.data.length; i++){
					$scope.listLength += 1;
					for(var j=0; j<data.data[i].cis.length; j++){
						data.data[i].cis[j].amount = BasketSystem.basket[data.data[i].cis[j].id] ? BasketSystem.basket[data.data[i].cis[j].id].amount : 0;
					}
				}
				$scope.searchResult = data.data;
			}
			
			$ionicScrollDelegate.$getByHandle('searchScroll').resize();
			$ionicScrollDelegate.$getByHandle('searchScroll').scrollTop(true);
			

		})
	}
	if($rootScope.searchKey){
		$scope.searchKey = $rootScope.searchKey;
		$scope.goSearch();
	}

	//搜索功能
	$scope.search = function(){
		if(!$scope.searchKey){
			$ionicPopup.alert({
				title  : '请输入关键字进行搜索',
				okText : '确定'
			});
			return;
		}
		
		$scope.goSearch();
	}

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
					for(var ci in $scope.searchResult){
						if($scope.searchResult[ci].id === si_id){
							$scope.searchResult[ci].is_favorite = is_favorite === 1 ? 2 : 1;
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
}])