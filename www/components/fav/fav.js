yunShan

    .controller('FavController', ['$scope', 'GlobalService', 'Fav', '$ionicLoading', '$rootScope', '$ionicPopup', '$state', '$stateParams', 'PicURL', 'BasketSystem', function ($scope, GlobalService, Fav, $ionicLoading, $rootScope, $ionicPopup, $state, $stateParams, PicURL, BasketSystem) {
        $scope.picURL = PicURL;
        $ionicLoading.show();

        $stateParams.pageNumber = $stateParams.pageNumber || 1;
        $scope.pageNumber = parseInt($stateParams.pageNumber, 10);

        $scope.obj = {};
        if ($scope.pageNumber > 1) {
            $scope.obj.pre = true;
        }
        //登录状态，请求列表
        Fav.getFav({
            pageNumber: $stateParams.pageNumber
        })
            .success(function (data) {

                $ionicLoading.hide();
                if (data.ret === 1) {
                    if (data.data!="") {
                        $scope.currentPgae = data.data.page;
                        $scope.totalPages = data.data.total_pages;
                        for (var i = 0; i < data.data.rows.length; i++) {
                            for (var j = 0; j < data.data.rows[i].cis.length; j++) {
                                data.data.rows[i].cis[j].amount = BasketSystem.basket[data.data.rows[i].cis[j].id] ? BasketSystem.basket[data.data.rows[i].cis[j].id].amount : 0;
                            }
                        }
                        $scope.favList = data.data.rows;
                        if ($scope.pageNumber < $scope.totalPages) {
                            $scope.obj.next = true;
                        }
                    }else{
                        $scope.currentPgae = 1;
                        $scope.totalPages = 1;
                    }
                }
            })


        // 改变收藏状态
        $scope.changeFav = function (ci_ids, is_favorite, si_id) {
            $ionicLoading.show();
            GlobalService.changeFav({
                "ci_ids": ci_ids,
                "is_favorite": is_favorite
            })
                .success(function (data) {
                    $ionicLoading.hide();
                    if (data.ret === 1) {
                        for (var ci in $scope.favList) {
                            if ($scope.favList[ci].id === si_id) {
                                $scope.favList[ci].is_favorite = is_favorite === 1 ? 2 : 1;
                                //add by yinkw 取消收藏后直接从我的常用菜中清除 2015-05-16
                                if(is_favorite===1){
                                	$scope.favList.splice(ci,1);
                                }
                                //---end------
                            }
                        }
                        $ionicPopup.alert({
                            title: is_favorite === 1 ? '取消收藏成功' : '收藏成功'
                        })
                    }
                    else {
                        $ionicPopup.alert({
                            title: data.msg
                        })
                    }

                })
        }
    }])