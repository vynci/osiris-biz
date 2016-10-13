app.controller('ManagerPortfolioCtrl', function($scope, serviceService, $ionicLoading, portfolioService, $ionicPopup) {
	console.log('manager services controller');

	var userId = '';

	if(Parse.User.current()){
		userId = Parse.User.current().get('profileId');

		$ionicLoading.show({
			template: 'Loading...'
		}).then(function(){

		});

		getPortfolioById(userId);
	}else{
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.transitionTo('tab.account-login', null, {reload: true, notify:true});
	}

	$scope.viewPortfolio = function(portfolio){
		console.log(portfolio);

		var myPopup = $ionicPopup.show({
			template: '<div style=""><img style="width:100%;" src="' + portfolio.imagePath +'"></div><br><p>' + portfolio.description + '</p>',
			title: '<b>View Portfolio</b>',
			subTitle: '',
			scope: $scope,
			buttons: [
				{ text: 'Close' }
			]
			});

			myPopup.then(function(res) {
				console.log('Tapped!', res);
			});


	}

	$scope.showUploadOption = function() {
		$scope.data = {};

		// An elaborate, custom popup
		var myPopup = $ionicPopup.show({
			template: '',
			title: '<b>Choose</b>',
			subTitle: '',
			scope: $scope,
			buttons: [
				{ text: 'Close' },
				{
					text: '<b>Camera</b>',
					type: 'button-energized',
					onTap: function(e) {
						if (!$scope.data.wifi) {
							//don't allow the user to close unless he enters wifi password
							e.preventDefault();
						} else {
							return $scope.data.wifi;
						}
					}
				},
				{
					text: '<b>Gallery</b>',
					type: 'button-balanced',
					onTap: function(e) {
						if (!$scope.data.wifi) {
							//don't allow the user to close unless he enters wifi password
							e.preventDefault();
						} else {
							return $scope.data.wifi;
						}
					}
				}
			]
			});


			myPopup.then(function(res) {
				console.log('Tapped!', res);
			});

			};

	function getPortfolioById(id){
		portfolioService.getPortfolioById(id)
		.then(function(results) {
			// Handle the result
			console.log(results);
			$scope.artistPortfolio = results;
			$ionicLoading.hide();
		}, function(err) {
			$ionicLoading.hide();
			// Error occurred
			console.log(err);
		}, function(percentComplete) {
			console.log(percentComplete);
		});
	}
})
