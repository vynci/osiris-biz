app.controller('LoginCtrl', function($scope, $ionicLoading, $rootScope, $ionicHistory, $state, $ionicPopup) {
	console.log('login!');
	var userId = '';
	$scope.loginData = {};
	$scope.forgotPasswordEmail = {};

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
		$scope.isLoading = true;
		userLogin($scope.loginData.username, $scope.loginData.password);
	};

	$scope.forgotPassword = function(){
		var myPopup = $ionicPopup.show({
			template: '<input style="border: 1px solid rgb(68, 68, 68); border-radius: 30px; padding-left: 15px;" type="text" placeholder="Enter Email Address" ng-model="forgotPasswordEmail.email">',
			title: '<b>Forgot Password</b>',
			subTitle: 'Please enter the email address you registered with and we will send you instructions on how to reset your password.',
			scope: $scope,
			buttons: [
				{ text: 'Cancel' },
				{
					text: '<b>Reset Password</b>',
					type: 'button-assertive',
					onTap: function(e) {
						Parse.Cloud.run('request-reset', {email: $scope.forgotPasswordEmail.email}, {
							success: function(secretString) {
								// obtained secret string
								console.log(secretString);
								var alertPopup = $ionicPopup.alert({
									title: 'Reset Password Request',
									template: 'Password reset request sent. Please check your email for further instructions.'
								});

								alertPopup.then(function(res) {
									console.log('Thank you for not eating my delicious ice cream cone');
								});
							},
							error: function(error) {
								console.log(error);
								var alertPopup = $ionicPopup.alert({
									title: 'Reset Password Request',
									template: 'Sorry, the email address you entered is not registered.'
								});

								alertPopup.then(function(res) {
									console.log('Thank you for not eating my delicious ice cream cone');
								});
							}
						});
					}
				}
			]
		});

		myPopup.then(function(res) {
			console.log('Tapped!', res);
		});
	}


	var userLogin = function(username, password){
		Parse.User.logIn(username, password, {
			success: function(user) {
				// Do stuff after successful login.
				console.log(user.attributes);
				if(user.attributes.userType === 'artist'){
					$rootScope.currentUser = Parse.User.current();
					$scope.isLoading = false;
					$rootScope.pubnubRestart();
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					$state.transitionTo('tab.dash', null, {reload: true, notify:true});
				}else{
					Parse.User.logOut().then(function(){
						$rootScope.currentUser = Parse.User.current();  // this will now be null
						$ionicHistory.nextViewOptions({
							disableBack: true
						});
						$rootScope.unsubscribe();
					});

					$scope.isLoading = false;
					var alertPopup = $ionicPopup.alert({
						title: 'Login Error',
						template: 'Sorry your account is non-artist. Please visit <a href="http://blush.ph/register">blush.ph/register</a> to submit a registration request.'
					});

					alertPopup.then(function(res) {
					});
				}
			},
			error: function(user, error) {
				// The login failed. Check error to see why.
				$scope.isLoading = false;
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
