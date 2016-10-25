app.controller('LoginCtrl', function($scope, $ionicLoading, $rootScope, $ionicHistory, $state, $ionicPopup) {
	console.log('login!');
	var userId = '';
	$scope.loginData = {};

	$scope.$on('$ionicView.enter', function(e) {
		console.log('enter view');
		if(Parse.User.current()){
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.transitionTo('tab.account', null, {reload: true, notify:true});
		}
	});

	$scope.doLogin = function() {
		$ionicLoading.show({
			template: 'Logging in...'
		}).then(function(){
			console.log("The loading indicator is now displayed");
		});
		userLogin($scope.loginData.username, $scope.loginData.password);
	};


	var userLogin = function(username, password){
		Parse.User.logIn(username, password, {
			success: function(user) {
				// Do stuff after successful login.
				$rootScope.currentUser = Parse.User.current();
				$ionicLoading.hide();
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.transitionTo('tab.dash', null, {reload: true, notify:true});
			},
			error: function(user, error) {
				// The login failed. Check error to see why.
				$ionicLoading.hide();
				var alertPopup = $ionicPopup.alert({
					title: 'Login Error',
					template: 'Sorry ' + error.message
				});

				alertPopup.then(function(res) {
				});
			}
		});
	}
});
